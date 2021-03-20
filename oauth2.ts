import { Webview } from "./deps.ts";
import { serve, ServerRequest } from "./deps.ts";
import { parsedArgsGetType, parsedArgsRefreshType } from "./arguments.ts";
import { Repeater } from "./deps.ts";
import { assert } from "./deps.ts";
import { runtypes as t } from "./deps.ts";


export async function getAuth(input:t.Static<typeof parsedArgsGetType>):Promise<string>{
    const authURL = new URL("authorize",input.accountsURL);

    const randomState = crypto.getRandomValues(new Uint8Array(32));
    let randomStateString = "";
    for(const byte of randomState){
        randomStateString += "0123456789abcdef".charAt((byte & 0xf0) >> 4);
        randomStateString += "0123456789abcdef".charAt(byte & 0x0f);
    }

    const authSearch = new URLSearchParams();
    authSearch.append("client_id",input.clientId);
    authSearch.append("response_type","code");
    authSearch.append("redirect_uri",input.callbackURL);
    authSearch.append("state",randomStateString);
    authSearch.append("scope",input.scope);
    authSearch.append("show_dialog","false");

    authURL.search = `?${authSearch.toString()}`;

    const userBrowser = new Webview({url:authURL.toString()});
    const userBrowserPromise = userBrowser.run();

    const server = serve({port: 8080});
    let authCode = "";
    
    for await (const event of Repeater.merge([server,userBrowserPromise])){
        if(event instanceof ServerRequest){
            if(event.url.startsWith("/?")){
                const query = new URLSearchParams(event.url.slice(2));
                if(query.has("code")){
                    await event.respond({body: "Window should close soon"});
                    await event.finalize();
                    const code = query.get("code");
                    authCode = code??"";
                    server.close();
                    userBrowser.exit();
                    break;
                }
            }
        } else {
            server.close();
        }
    }
    if(authCode === ""){
        const errObj = {
            error: "User cancelled login"
        }
        console.log(JSON.stringify(errObj));
    }
    return authCode;
}


interface getAccessReturn{
    accessToken: string,
    refreshToken: string,
    expiresIn: number
}

const accessResType = t.Record({
    access_token: t.String,
    token_type: t.Literal("Bearer"),
    expires_in: t.Number,
    refresh_token: t.String
});

export async function getAccess(input:t.Static<typeof parsedArgsGetType>,authCode: string):Promise<getAccessReturn>{
    const accessURL = new URL("/api/token",input.accountsURL);
    const authorizationString = btoa(`${input.clientId}:${input.clientSecret}`);
    const accessReq = await fetch(accessURL,{
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${authorizationString}`
        },
        method: "POST",
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code: authCode,
            redirect_uri: input.callbackURL
        }).toString()
    });
    if(accessReq.ok){
        const accessResult = await accessReq.json();
        assert(accessResType.guard(accessResult),"Unknown response from server");
        return {
            accessToken: accessResult.access_token,
            refreshToken: accessResult.refresh_token,
            expiresIn: accessResult.expires_in
        }
    } else {
        throw new Error(`Could not get an access token from server: ${accessReq.statusText}`);
    }
}


interface refreshReturn{
    accessToken: string,
    expiresIn: number
}

const serverRefreshResponseType = t.Record({
    access_token: t.String,
    token_type: t.Literal("Bearer"),
    scope: t.String,
    expires_in: t.Number
});

export async function refresh(input: t.Static<typeof parsedArgsRefreshType>):Promise<refreshReturn>{
    const accessURL = new URL("/api/token",input.accountsURL);
    const authorizationString = btoa(`${input.clientId}:${input.clientSecret}`);
    const refreshReq = await fetch(accessURL,{
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${authorizationString}`
        },
        method: "POST",
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: input.refreshToken,
        }).toString()
    });
    if(refreshReq.ok){
        const refreshResult = await refreshReq.json();
        assert(serverRefreshResponseType.guard(refreshResult));
        return {
            accessToken: refreshResult.access_token,
            expiresIn: refreshResult.expires_in
        }
    } else {
        throw new Error(`Could not refresh token: ${refreshReq.statusText}`);
    }
}
import { parseArgs } from "./arguments.ts";
import { parsedArgsRefreshType, parsedArgsGetType } from "./arguments.ts";
import { runtypes as t } from "./deps.ts";
import { assert } from "./deps.ts";
import { getAuth, getAccess, refresh as refreshOAuth } from "./oauth2.ts";

export async function get(clientId: string, clientSecret: string,accountsURL: string, scope: string = "", callbackURL: string = "http://127.0.0.1:8080", port: number = 8080){
    const opts: t.Static<typeof parsedArgsGetType> = {
        _: ["get"],
        c: callbackURL,
        callback: callbackURL,
        port,
        p: port,
        s: scope,
        scope,
        $0: "cli-oauth2",
        clientId,
        clientSecret,
        callbackURL,
        accountsURL
    };
    return await getAccess(opts,await getAuth(opts));
}

export async function refresh(clientId: string, clientSecret: string,accountsURL: string, refreshToken: string){
    const opts: t.Static<typeof parsedArgsRefreshType> = {
        _: ["refresh"],
        $0: "cli-oauth2",
        clientId,
        clientSecret,
        accountsURL,
        refreshToken
    };
    return await refreshOAuth(opts);
}
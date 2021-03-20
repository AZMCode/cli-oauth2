import { yargs } from "./deps.ts";
import { Arguments } from "./deps.ts";
import { runtypes as t } from "./deps.ts";
import { assert } from "./deps.ts";

export const parsedArgsGetType = t.Record({
    _: t.Tuple(t.Literal("get")),
    c: t.String,
    callback: t.String,
    callbackURL: t.String,
    port: t.Number,
    p: t.Number,
    scope: t.String,
    s: t.String,
    "$0": t.String,
    clientId: t.String,
    clientSecret: t.String,
    accountsURL: t.String
});
export const parsedArgsRefreshType = t.Record({
    _: t.Tuple(t.Literal("refresh")),
    "$0": t.String,
    refreshToken: t.String,
    accountsURL: t.String,
    clientId: t.String,
    clientSecret: t.String
});
export const parsedArgsType = t.Union(parsedArgsGetType,parsedArgsRefreshType);



export function parseArgs(args:string[]):t.Static<typeof parsedArgsType>{
    const parsedArgs = yargs(args)
    .command(
        "get <clientId> <clientSecret> <accountsURL> [options]",
        "Gets new access token, refresh token",
        (elm:Arguments)=>{return elm
            .positional("clientId",{
            describe: "The Client ID",
            type: "string"
            })
            .positional("clientSecret",{
                describe: "The Client Secret",
                type: "string"
            })
            .positional("accountsURL",{
                describe: "Base URL for OAuth2 endpoints",
                type: "string"
            })
            .option("callbackURL",{
                alias: ["c","callback"],
                describe: "The Callback URL",
                type: "string",
                default: "http://127.0.0.1:8080"
            })
            .option("port",{
                alias: "p",
                describe: "The port used in the callback URL",
                type: "number",
                default: 8080
            })
            .option("scope",{
                alias: "s",
                describe: "The scopes to be granted as a single space-separated string",
                type: "string",
                default: ""
            });
        }
    )
    .command(
        "refresh <clientId> <clientSecret> <refreshToken> <accountsURL>",
        "Refreshes access token",
        (elm:Arguments)=>{return elm
            .positional("clientId",{
            describe: "The Client ID",
            type: "string"
            })
            .positional("clientSecret",{
                describe: "The Client Secret",
                type: "string"
            })
            .positional("refreshToken",{
                describe: "The Refresh token",
                type: "string"
                })
            .positional("accountsURL",{
                describe: "Base URL for OAuth2 endpoints",
                type: "string"
            })
        }
    )
    .parserConfiguration({
        "short-option-groups":  true,
        "camel-case-expansion": true,
        "strip-dashed":         true,
        "dot-notation":         false,
        "parse-numbers":        false,
        "boolean-negation":     false,
        "deep-merge-config":    false,
        "strip-aliases":        true
    })
    .help()
    .version("0.0.2")
    .scriptName("cli-oauth2")
    .strictCommands()
    .demandCommand(1)
    .parse();
    
    assert(parsedArgsType.guard(parsedArgs),"Yargs returned unexpected args");
    return parsedArgs;
}
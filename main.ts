#!/usr/bin/env -S deno run -A --unstable
import { parseArgs } from "./arguments.ts";
import { parsedArgsRefreshType, parsedArgsGetType } from "./arguments.ts";
import { assert } from "./deps.ts";
import { getAuth, getAccess, refresh } from "./oauth2.ts"


const args = parseArgs(Deno.args);
if(args._[0] == "get"){
    assert(parsedArgsGetType.guard(args),"Unexpected args object type");
    console.log(JSON.stringify(await getAccess(args,await getAuth(args)))); 
} else {
    assert(parsedArgsRefreshType.guard(args),"Unexpected args object type");
    console.log(JSON.stringify(await refresh(args)));
}

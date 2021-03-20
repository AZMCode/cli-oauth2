#!/usr/bin/env -S deno run -A --unstable
import { parseArgs } from "./arguments.ts";
import { parsedArgsRefreshType, parsedArgsGetType } from "./arguments.ts";
import { assert } from "./deps.ts";
import { getAuth, getAccess, refresh } from "./oauth2.ts"


const args = parseArgs(Deno.args);
if(args._[0] == "get"){
    assert(parsedArgsGetType.guard(args),"Unexpected args object type");
    console.log(JSON.stringify(await getAccess(args,await getAuth(args)))); 
} else if(args._[0] == "refresh"){
    assert(parsedArgsRefreshType.guard(args),"Unexpected args object type");
    console.log(JSON.stringify(await refresh(args)));
} else {
    throw new Error(`Unknown Command: ${args._[0]}`);
}

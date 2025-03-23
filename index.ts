import startServer from "./bds/client";
import bdsRoute from "./routes/bds";
import oauthRoute from "./routes/oauth";
import { readFile} from "node:fs/promises";
import { Database } from "bun:sqlite";

const db = new Database("./mydb.sqlite");

const port = 8080;

console.log(`Listening on: ${port}`);

Bun.serve({
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(await readFile("./static/index.html", { encoding: "utf-8" }), {
        headers: {
          "Content-Type": "text/html",
        },
        status: 200,
      });
    }

    if (url.pathname === "/scripts/index.js") {
      return new Response(await readFile("./static/scripts/index.js", { encoding: "utf-8" }), {
        headers: {
          "Content-Type": "application/javascript",
        },
        status: 200,
      });
    }

     if (url.pathname === "/scripts/index.js.map") {
      return new Response(await readFile("./static/scripts/index.js.map", { encoding: "utf-8" }), {
        headers: {
          "Content-Type": "application/javascript",
        },
        status: 200,
      });
    }

    if (url.pathname === "/styles/index.css") {
      return new Response(await readFile("./static/styles/index.css", { encoding: "utf-8" }), {
        headers: {
          "Content-Type": "text/css",
        },
        status: 200,
      });
    }

    if (url.pathname === "/favicon.ico") {
      try {
        return new Response(await readFile("./static/favicon.ico"), {
        headers: {
          "Content-Type": "image/x-icon",
        },
        status: 200,
      });
      } catch (e) {
        return new Response("Not found", { status: 404 });
      }
    }

    if (url.pathname.startsWith("/serve")) {
      const res = await startServer();

      return new Response(res, {
        headers: {
          "Content-Type": "text/plain",
        },
        status: 200,
      });
    }

    if (url.pathname.startsWith("/bds")) {
      return await bdsRoute(url, req) ?? new Response("Not found", { status: 404 });
    }

    if (url.pathname.startsWith("/api")) {


      if (url.pathname === "/api/query") {
        const body = await req.json();
        const sql = body.sql;
        if (!sql) {
          return new Response(
            JSON.stringify({
              error: "SQL query is required",
            }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              status: 400,
            }
          );
        }

        const stmt = db.query(sql);
        const results = stmt.all();
        return new Response(
          JSON.stringify({
            results
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            status: 200,
          }
        );
      }

      if (url.pathname === "/api/schema") {
        const stmt = db.query("SELECT name FROM sqlite_master WHERE type='table';");
        const tableNames = stmt.all();
        return new Response(
          JSON.stringify({
            results: tableNames,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            status: 200,
          }
        );
      }


    }

    if (url.pathname === "/oauth/callback") {
      return await oauthRoute(url, req);
    }
    return new Response(
      JSON.stringify({
        error: "Invalid path",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 404,
      }
    );
  },
  port,
});

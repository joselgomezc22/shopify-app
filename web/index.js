// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import { Shopify, LATEST_API_VERSION } from "@shopify/shopify-api";

import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";
import { setupGDPRWebHooks } from "./gdpr.js";
import productCreator from "./helpers/product-creator.js";
import redirectToAuth from "./helpers/redirect-to-auth.js";
import ensureBilling, { BillingInterval } from "./helpers/ensure-billing.js";
import { AppInstallations } from "./app_installations.js";

import PublicConfig from "./app_config.js";

import fetch from "node-fetch";

const USE_ONLINE_TOKENS = false;

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

/**
 * @NOTES
 *
 */
// TODO : the app.config.json path must be provided by a env var
const JSON_CONFIG_FILE = readFileSync("./app.config.json");
const JSON_CONFIG = JSON.parse(JSON_CONFIG_FILE);

// TODO: There should be provided by env vars
const DEV_INDEX_PATH = `${process.cwd()}${JSON_CONFIG.front_index_path}`;
const PROD_INDEX_PATH = `${process.cwd()}/frontend/dist/`;

const DB_PATH = `${process.cwd()}/database.sqlite`;

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: JSON_CONFIG.scopes.split(","),
  HOST_NAME: process.env.HOST.replace(/https?:\/\//, ""),
  HOST_SCHEME: process.env.HOST.split("://")[0],
  API_VERSION: LATEST_API_VERSION,
  IS_EMBEDDED_APP: true,
  ACCES_INFO: "0",
  // This should be replaced with your preferred storage strategy
  // See note below regarding using CustomSessionStorage with this template.
  SESSION_STORAGE: new Shopify.Session.SQLiteSessionStorage(DB_PATH),
  ...(process.env.SHOP_CUSTOM_DOMAIN && {
    CUSTOM_SHOP_DOMAINS: [process.env.SHOP_CUSTOM_DOMAIN],
  }),
});

// NOTE: If you choose to implement your own storage strategy using
// Shopify.Session.CustomSessionStorage, you MUST implement the optional
// findSessionsByShopCallback and deleteSessionsCallback methods.  These are
// required for the app_installations.js component in this template to
// work properly.

Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/api/webhooks",
  webhookHandler: async (_topic, shop, _body) => {
    await AppInstallations.delete(shop);
  },
});

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const BILLING_SETTINGS = {
  required: false,
  // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
  // chargeName: "My Shopify One-Time Charge",
  // amount: 5.0,
  // currencyCode: "USD",
  // interval: BillingInterval.OneTime,
};

// This sets up the mandatory GDPR webhooks. You’ll need to fill in the endpoint
// in the “GDPR mandatory webhooks” section in the “App setup” tab, and customize
// the code when you store customer data.
//
// More details can be found on shopify.dev:
// https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks
setupGDPRWebHooks("/api/webhooks");

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production",
  billingSettings = BILLING_SETTINGS
) {
  const app = express();

  app.set("use-online-tokens", USE_ONLINE_TOKENS);
  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app, {
    billing: billingSettings,
  });

  /**
   * @param {string} plan_name
   * @returns Plan extra information
   */
  const getPlanExtraInfo = (plan_name) => {
    const plans = JSON_CONFIG.recurring_plans;
    const plan = plans.filter((item) => {
      return item.name == plan_name;
    })[0];
    return plan.extra_info;
  };

  // Do not call app.use(express.json()) before processing webhooks with
  // Shopify.Webhooks.Registry.process().
  // See https://github.com/Shopify/shopify-api-node/blob/main/docs/usage/webhooks.md#note-regarding-use-of-body-parsers
  // for more details.
  app.post("/api/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (e) {
      console.log(`Failed to process webhook: ${e.message}`);
      if (!res.headersSent) {
        res.status(500).send(e.message);
      }
    }
  });

  // All endpoints after this point will require an active session
  app.use(
    "/api/*",
    verifyRequest(app, {
      billing: billingSettings,
    })
  );
  app.get("/api/products/count", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  // Get the json config file.
  app.get("/api/json", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    res.status(200).send(JSON_CONFIG);
  });

  app.get("/api/products/create", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let status = 200;
    let error = null;

    try {
      await productCreator(session);
    } catch (e) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error });
  });

  // All endpoints after this point will have access to a request.body
  // attribute, as a result of the express.json() middleware
  app.use(express.json());


 /* 
  Reorder API
 
 */
  // app.post("/api/reorder", async (req, res) => {
  //   const session = await Shopify.Utils.loadCurrentSession(
  //     req,
  //     res,
  //     app.get("use-online-tokens")
  //   );

  //   const {id,products, type} = req.body
    
  //   const client = new Shopify.Clients.Rest(`https://${session.shop}`, session.accessToken)
  //   await client.put({
  //     path: `/admin/api/2023-01/custom_collections/${id}.json`,
  //     data: JSON.stringify(products)
  //   })
  //   /* const response = await fetch(`https://${session.shop}/admin/api/2023-01/custom_collections/${id}.json`,
  //   {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "X-Shopify-Access-Token": session["accessToken"],
  //     },
  //     body: JSON.stringify({
  //       custom_collection:{
  //         id,
  //         collects: [
  //           {
  //             product_id: 7392837468312,
  //             position: 1
  //           }
  //         ]
  //       }
  //     }),
  //   }) */
  //   /* return res.status(200).json({
  //     msg: "ok"
  //   }) */

  // })


  /**
   * * SHOPIFY CURL PROXY
   * @method {string}
   * @data {object}
   * @endpoint {string}
   */
  app.post("/api/shopify/proxy", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );

    const body = req.body;
    const data = body.data;
    const endpoint = body.endpoint;
    const method = body.method;

    let requestOptions = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session["accessToken"],
      },
      body: method == "GET" ? null : JSON.stringify(data),
    };
    console.log("first", JSON.stringify(data))

    const response = await fetch(
      `https://${session.shop}${endpoint}`,
      requestOptions
    );

    if (response.ok) {
      const data = await response.json();
      res.status(response.status).send(data);
    } else {
      console.log("fail",response);
      res.status(response.status).send(data);
    }
  });
  app.post("/api/shopify/proxy/with-pagination", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );

    const body = req.body;
    const data = body.data;
    const endpoint = body.endpoint;
    const method = body.method;

    const requestOptions = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session["accessToken"],
      },
      body: method == "GET" ? null : JSON.stringify(data),
    };

    const response = await fetch(
      `https://${session.shop}${endpoint}`,
      requestOptions
    );

    if (response.ok) {
      const data = await response.json();
      const link = response.headers.get("Link");

      res.status(response.status).send({
        data,
        link,
      });
    } else {
      res.status(response.status).send(data);
    }
  });
  app.post("/api/shopify/products/reorder", async (req, res) => {
    const { toChange } = req.body;
    console.log(toChange);
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );

    const client = new Shopify.Clients.Graphql(
      session.shop,
      session.accessToken
    );

    let id = "7392838746264";
    let position = "0";
    let collection = "284857139352";

    const REORDER_MUTATION = `
      mutation collectionReorderProducts($id: ID!, $moves: [MoveInput!]!) {
        collectionReorderProducts(id: $id, moves: $moves) {
          userErrors {
            field
            message
          }
        }
      }
    `;

    let moves = toChange.map((item) => {
      return {
        id: `gid://shopify/Product/${item.id}`,
        newPosition: String(item.position),
      };
    });
    
    let move = [
      {
        id: "gid://shopify/Product/7392837468312",
        newPosition: "0",
      },
      {
        id: "gid://shopify/Product/7392839073944",
        newPosition: "1",
      }
    ];

    console.log('move');
    console.log(move);
    console.log('----');
    console.log('moves');
    console.log(moves);


    const dataMutation = await client.query({
      data: {
        query: REORDER_MUTATION,
        variables: {
          id: "gid://shopify/Collection/284857139352",
          moves: moves,
        },
      },
    });

    console.log(dataMutation?.body?.data);

    /*const queryString = `{
      products (first: 3) {
        edges {
          node {
            id
            title
          }
        }
      }
    }`;

    const data = await client.query({
      data: queryString,
    });
    const p = data?.body?.data?.products;
    p.edges.map((e) => {
      //console.log(e);
    });*/
  });

  /**
   * RecurringApplicationCharge cancellation request
   * @id {number} : RecurringApplicationCharge identifier
   */
  app.post("/api/delete/billingRecurring", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );

    const billingId = req.body.id;

    const { RecurringApplicationCharge } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const data = await RecurringApplicationCharge.delete({
      session: session,
      id: billingId,
    });

    res.status(200).send(data);
  });

  /**
   * Get the current plan information
   */
  app.get("/api/plan/info", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );

    const { id } = session;
    const { db, options } = Shopify.Context.SESSION_STORAGE;

    //table
    const tbl = options.sessionTableName;
    //Query'
    const query = `SELECT subscription_info FROM ${tbl} WHERE id = '${id}'`;

    db.get(query, (err, row) => {
      if (row) {
        const { subscription_info } = row;
        console.log(subscription_info);
        res.status(200).send(subscription_info);
      }
    });
  });

  /**
   * * Setup plan information
   *  Store plan information on DB  DB column
   */
  app.post("/api/plan/setup", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );

    const plan_info = req.body;
    plan_info.extra_info = getPlanExtraInfo(plan_info.name);
    if (!plan_info.extra_info) {
      console.log(`The plan ${plan_info.name} has no extra information`);
    }

    const planInfoStore = {
      id: plan_info.id,
      name: plan_info.name,
      price: plan_info.price,
      extra_info: plan_info.extra_info,
    };

    const { id } = session;
    const { db, options } = Shopify.Context.SESSION_STORAGE;

    //table
    const tbl = options.sessionTableName;

    const data = [JSON.stringify(planInfoStore), id];

    //Query`
    const query = `UPDATE ${tbl} SET subscription_info = ? WHERE id = ?`;

    //console.log(query);

    db.get(query, data, (err) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
        return;
      }
      res.status(200).send(true);
    });
  });

  /**
   *  EnsureBilling for a recurring_application_charge
   */
  app.get("/api/ensureBilling", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    const body = req.body;

    const billingSettings = {
      required: true,
      chargeName: body.chargeName,
      amount: body.amount,
      currencyCode: "USD",
      interval: BillingInterval.Every30Days,
    };

    const data = await ensureBilling(session, billingSettings);
    console.log(data);
    if (data) res.status(200).send(data);
  });

  app.use((req, res, next) => {
    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${encodeURIComponent(
          shop
        )} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  if (isProd) {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    app.use(compression());
    app.use(serveStatic(PROD_INDEX_PATH, { index: false }));
  }

  app.use("/*", async (req, res, next) => {
    if (typeof req.query.shop !== "string") {
      res.status(500);
      return res.send("No shop provided");
    }

    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    const appInstalled = await AppInstallations.includes(shop);

    if (!appInstalled && !req.originalUrl.match(/^\/exitiframe/i)) {
      return redirectToAuth(req, res, app);
    }

    if (Shopify.Context.IS_EMBEDDED_APP && req.query.embedded !== "1") {
      const embeddedUrl = Shopify.Utils.getEmbeddedAppUrl(req);

      return res.redirect(embeddedUrl + req.path);
    }

    const htmlFile = join(
      isProd ? PROD_INDEX_PATH : DEV_INDEX_PATH,
      "index.html"
    );

    return res
      .status(200)
      .set("Content-Type", "text/html")
      .send(readFileSync(htmlFile));
  });

  return { app };
}

createServer().then(({ app }) => app.listen(PORT));

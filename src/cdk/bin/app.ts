import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { resolveStage } from "../stage";

import { ApiStack } from "../lib/api-stack";
import { WebStack } from "../lib/web-stack";
import { DynamoStack } from "../lib/dynamo-stack";

const app = new cdk.App();

// Stage config (prod | beta)
const cfg = resolveStage(app) as {
  name: string;
  nodeEnv?: string;
  lambda?: { memorySize?: number; timeoutSeconds?: number };
  tags?: Record<string, string>;
};

const account =
  process.env.CDK_DEFAULT_ACCOUNT ??
  process.env.AWS_ACCOUNT_ID ??
  "000000000000";

const region =
  process.env.CDK_DEFAULT_REGION ??
  process.env.AWS_REGION ??
  "us-east-1";

console.log(
  `[App] stage=${cfg.name} account=${account} region=${region}`
);

// ---------------- DynamoDB ----------------
const dynamo = new DynamoStack(app, `CoinlyDynamo-${cfg.name}`, {
  env: { account, region },
  stage: cfg.name,
  serviceName: "coinly",
});

// ---------------- API STACK ----------------
const api = new ApiStack(app, `CoinlyApi-${cfg.name}`, {
  env: { account, region },
  serviceName: "coinly-api",

  stage: {
    name: cfg.name,
    nodeEnv:
      cfg.nodeEnv ??
      (cfg.name === "prod" ? "production" : "development"),
    lambda: {
      memorySize: cfg.lambda?.memorySize ?? 512,
      timeout: cdk.Duration.seconds(
        cfg.lambda?.timeoutSeconds ?? 20
      ),
    },
    cors: {
      allowCredentials: true,
      allowHeaders: ["content-type", "authorization"],
      allowMethods: [
        apigwv2.CorsHttpMethod.GET,
        apigwv2.CorsHttpMethod.POST,
        apigwv2.CorsHttpMethod.OPTIONS,
      ],
      allowOrigins: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ],
      maxAge: cdk.Duration.hours(12),
    },
  },

  ddbTable: dynamo.table,
});

// ---------------- WEB STACK ----------------
const apiEndpoint = api.httpApi.apiEndpoint;
const apiDomainName = cdk.Fn.select(
  2,
  cdk.Fn.split("/", apiEndpoint)
);

const web = new WebStack(app, `CoinlyWeb-${cfg.name}`, {
  env: { account, region },
  stage: { name: cfg.name },
  serviceName: "coinly-web",
  frontendBuildPath: "../../frontend/dist",
  apiDomainName,
  apiPaths: ["/trpc/*", "/health", "/hello"],
});

// ---------------- TAGGING ----------------
if (cfg.tags) {
  [dynamo, api, web].forEach((stack) => {
    Object.entries(cfg.tags!).forEach(([k, v]) => {
      cdk.Tags.of(stack).add(k, v);
    });
  });
}

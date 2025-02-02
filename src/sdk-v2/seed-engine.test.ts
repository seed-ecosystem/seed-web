
import { expect, test } from "vitest";
import { createSeedEngine, SeedEngine } from "./seed-engine";

test("seed-engine-open", async () => {
  const engine = createSeedEngine("wss://meetacy.app/seed-kt");
  engine.start();
  await awaitConnected(engine);
});

test("seed-engine-close", async () => {
  const engine = createSeedEngine("wss://meetacy.app/seed-kt");
  engine.start();
  await awaitConnected(engine);
  engine.stop();
  await awaitDisconnected(engine);
});

test("seed-engine-restore", async () => {
  const engine = createSeedEngine("wss://meetacy.app/seed-kt");
  engine.start();
  await awaitConnected(engine);
  engine.stop();
  await awaitDisconnected(engine);
  engine.start();
  await awaitConnected(engine);
});

test("seed-engine-connect", async () => {
  const engine = createSeedEngine("wss://meetacy.app/seed-kt");
  engine.start();
  await awaitConnected(engine);
  await engine.connectUrl("wss://meetacy.app/seed-go");
});

test("seed-engine-forward", async () => {
  const engine = createSeedEngine("wss://meetacy.app/seed-kt");
  engine.start();
  await awaitConnected(engine);
  await engine.connectUrl("wss://meetacy.app/seed-go");
  await engine.executeOrThrow({
    url: "wss://meetacy.app/seed-go",
    payload: {
      type: "ping",
    },
  });
});

test("seed-engine-ping", async () => {
  const engine = createSeedEngine("wss://meetacy.app/seed-kt");
  engine.start();
  await awaitConnected(engine);
  await engine.connectUrl("wss://meetacy.app/seed-kt");
  await engine.executeOrThrow({
    url: "wss://meetacy.app/seed-kt",
    payload: {
      type: "ping",
    },
  });
});


test("seed-engine-reject-closed", async () => {
  const engine = createSeedEngine("wss://meetacy.app/seed-kt");
  let error = false;
  try {
    await engine.executeOrThrow({ url: "wss://meetacy.app/seed-kt", payload: { type: "ping" } });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    error = true;
  }
  expect(error, "Request must be rejected without open").toBe(true);
});

test("seed-engine-reject-disconnected", async () => {
  const engine = createSeedEngine("wss://meetacy.app/seed-kt");
  engine.start();
  awaitConnected(engine);
  let error = false;
  try {
    await engine.executeOrThrow({ url: "wss://meetacy.app/seed-kt", payload: { type: "ping" } });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    error = true;
  }
  expect(error, "Request must be rejected without open").toBe(true);
});

function awaitConnected(engine: SeedEngine): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const cancel = engine.connectedEvents.subscribe(connected => {
      console.log("TEST", connected);
      if (connected) {
        resolve();
      } else {
        reject("Expected connected");
      }
      cancel();
    });
  });
}

function awaitDisconnected(engine: SeedEngine) {
  return new Promise<void>((resolve, reject) => {
    const cancel = engine.connectedEvents.subscribe(connected => {
      if (!connected) {
        resolve();
      } else {
        reject("Expected disconnected");
      }
      cancel();
    });
  });
}


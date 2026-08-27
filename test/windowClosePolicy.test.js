const test = require("node:test");
const assert = require("node:assert/strict");
const { shouldQuitOnWindowClose } = require("../src/windowClosePolicy");

test("keeps ordinary window closes in the tray when tray mode is enabled", () => {
    assert.equal(shouldQuitOnWindowClose({
        isQuitting: false,
        useTray: true,
        isSessionShuttingDown: false
    }), false);
});

test("quits on compositor close requests when tray mode is disabled", () => {
    assert.equal(shouldQuitOnWindowClose({
        isQuitting: false,
        useTray: false,
        isSessionShuttingDown: false
    }), true);
});

test("allows an explicit application quit while tray mode is enabled", () => {
    assert.equal(shouldQuitOnWindowClose({
        isQuitting: true,
        useTray: true,
        isSessionShuttingDown: false
    }), true);
});

test("allows session shutdown to close the window while tray mode is enabled", () => {
    assert.equal(shouldQuitOnWindowClose({
        isQuitting: false,
        useTray: true,
        isSessionShuttingDown: true
    }), true);
});

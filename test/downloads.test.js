const test = require("node:test");
const assert = require("node:assert/strict");
const {
    isAttachmentDownloadUrl,
    startAttachmentDownload
} = require("../src/downloads");

const attachmentUrl = "https://chat.google.com/get_attachment_url?url_type=DOWNLOAD_URL&attachment_id=123";

test("recognizes Google Chat attachment download URLs", () => {
    assert.equal(isAttachmentDownloadUrl(attachmentUrl), true);
    assert.equal(isAttachmentDownloadUrl("https://chat.google.com/room/abc"), false);
    assert.equal(isAttachmentDownloadUrl(), false);
});

test("starts an attachment download in the existing web contents", () => {
    const downloadedUrls = [];
    const webContents = {
        downloadURL: (url) => downloadedUrls.push(url)
    };

    assert.equal(startAttachmentDownload(webContents, attachmentUrl), true);
    assert.deepEqual(downloadedUrls, [attachmentUrl]);
});

test("does not start a download for a regular Chat URL", () => {
    const webContents = {
        downloadURL: () => assert.fail("downloadURL should not be called")
    };

    assert.equal(startAttachmentDownload(webContents, "https://chat.google.com/room/abc"), false);
});

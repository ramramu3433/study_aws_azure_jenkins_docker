"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var child_process = require("child_process");
var stringifyCsv = require("csv-stringify");
var fs = require("fs");
var os = require("os");
var path = require("path");
var q = require("q");
var dialogsManager = require("../DialogsManager");
var utilities = require("../../Utilities");
var OperationStatus_1 = require("./OperationStatus");
var stringifyCsvOptions = {
    delimiter: ",",
    rowDelimiter: "windows"
};
if (utilities.isOSX()) {
    stringifyCsvOptions.rowDelimiter = "mac";
}
else if (utilities.isLinux()) {
    stringifyCsvOptions.rowDelimiter = "unix";
}
var execSync = child_process.execSync;
/**
 * Returns the operating system's default directory for temporary files.
 */
function getTempDirectory() {
    return os.tmpdir();
}
exports.getTempDirectory = getTempDirectory;
var trustedFileExtensions = null;
function tryOpenFileSafely(filePath) {
    if (!trustedFileExtensions || !trustedFileExtensions.length) {
        var extensionsFromJson = require("./manifests/trustedFileExtensions.json");
        var extensionsString = extensionsFromJson.allowedToOpen;
        trustedFileExtensions = extensionsString.split(";");
    }
    return q.Promise(function (resolve, reject) {
        var fileExtName = path.extname(filePath).toLowerCase();
        if (trustedFileExtensions.some(function (value) { return value === fileExtName; })) {
            resolve(openFileWithDefaultApplication(filePath));
        }
        else {
            // localize
            var confirmationMessage = "Security warning: This file is potentially unsafe.\nAre you sure you want to open it?";
            dialogsManager.showYesNoMessageBox(confirmationMessage, "warning").then(function (value) {
                if (value) {
                    resolve(openFileWithDefaultApplication(filePath));
                }
                else {
                    resolve({ status: OperationStatus_1.default.Aborted, message: "Operation aborted: " });
                }
            });
        }
    });
}
exports.tryOpenFileSafely = tryOpenFileSafely;
/**
 * Open a file with user prefered application.
 */
function openFileWithDefaultApplication(filePath) {
    var openCmd = null;
    if (utilities.isWin()) {
        // The double quotes are used so that Windows will interpret the quoted command path correctly.
        // Otherwise, it will assume the first quoted string as the start command's new window title.
        openCmd = "start \"\"";
    }
    else if (utilities.isOSX()) {
        openCmd = "open";
    }
    else if (utilities.isLinux()) {
        openCmd = "xdg-open";
    }
    if (process.env.SUDO_USER) {
        openCmd = "sudo -u " + process.env.SUDO_USER + " " + openCmd;
    }
    var command = openCmd + " \"" + escapeQuotes(filePath) + "\"";
    try {
        execSync(command, { stdio: "ignore" });
    }
    catch (error) {
        console.error(error);
        return { status: OperationStatus_1.default.Failed, message: error.message };
    }
    return { status: OperationStatus_1.default.Succeeded, message: null };
}
exports.openFileWithDefaultApplication = openFileWithDefaultApplication;
function escapeQuotes(s) {
    return s.replace(/"/g, "\\\"");
}
exports.escapeQuotes = escapeQuotes;
/**
 * Read up to the specified number of text lines from a file.
 *
 * If more lines can be read, a continuation token is returned that, if passed back to the function, will begin
 * reading from where it last left off.
 *
 * This works fine for UTF-8, because LF never occurs as either the leading or trailing bytes of a UTF-8 character
 * (always >= 0x80).
 */
function readLines(filePath, maxLines, continuationToken) {
    if (maxLines === void 0) { maxLines = 1; }
    if (continuationToken === void 0) { continuationToken = null; }
    return q.Promise(function (resolve, reject) {
        fs.open(filePath, "r", function (error, fd) {
            if (error) {
                reject(error);
                return;
            }
            var cpuIntervalInMilliseconds = 50;
            var lineFeed = 0x0A;
            var startPosition = continuationToken ?
                continuationToken.filePosition :
                0;
            var blockSize = 65536;
            var dataBuffer = new Buffer(blockSize);
            var totalBytesRead = 0;
            var linesRead = 0;
            function read(done) {
                var start = Date.now();
                var bytesRead = 0;
                while (true) {
                    // If the buffer is full, copy the buffer to a larger buffer.
                    // This should not happen very often if the number and the length of lines is small.
                    if (totalBytesRead >= blockSize) {
                        blockSize *= 2;
                        var newBuffer = new Buffer(blockSize);
                        dataBuffer.copy(newBuffer);
                        dataBuffer = newBuffer;
                    }
                    try {
                        // Read from the file one byte at a time.
                        bytesRead = fs.readSync(fd, dataBuffer, 
                        /*offset*/ totalBytesRead, 
                        /*length*/ 1, 
                        /*position*/ startPosition + totalBytesRead);
                    }
                    catch (error) {
                        done(error);
                        return;
                    }
                    totalBytesRead += bytesRead;
                    if (!bytesRead) {
                        // We've reached the end of the file before reading the desired number of lines.
                        done();
                        return;
                    }
                    var char = dataBuffer[totalBytesRead - bytesRead];
                    if (char === lineFeed) {
                        // Check for line feed characters to count lines.
                        // We don't need to look for carriage returns, because if they are part of a line delimiter,
                        // they will be immediately followed by line feeds.
                        linesRead++;
                    }
                    if (linesRead >= maxLines) {
                        done();
                        return;
                    }
                    else if (Date.now() - start >= cpuIntervalInMilliseconds) {
                        // Reading one character at a time asynchronously actually slows us down,
                        // because we're interrupted after each read.
                        // Instead, we read characters for a set amount of time, then voluntarily yield the CPU.
                        setTimeout(read, 0, done);
                        return;
                    }
                }
            }
            read(function (error) { return fs.close(fd, function (closeError) {
                if (closeError || error) {
                    reject(closeError || error);
                    return;
                }
                resolve({
                    chunk: dataBuffer.slice(0, totalBytesRead).toString("utf8"),
                    continuationToken: totalBytesRead ?
                        { filePosition: startPosition + totalBytesRead } :
                        null
                });
            }); });
        });
    });
}
exports.readLines = readLines;
function writeCsvToFile(filePath, data) {
    return q.Promise(function (resolve, reject) {
        stringifyCsv(data, stringifyCsvOptions, function (error, output) {
            if (error) {
                reject(error);
            }
            else {
                writeToFile(filePath, output).then(resolve, reject);
            }
        });
    });
}
exports.writeCsvToFile = writeCsvToFile;
function appendCsvToFile(filePath, data) {
    return q.Promise(function (resolve, reject) {
        stringifyCsv(data, stringifyCsvOptions, function (error, output) {
            if (error) {
                reject(error);
            }
            else {
                appendToFile(filePath, output).then(resolve, reject);
            }
        });
    });
}
exports.appendCsvToFile = appendCsvToFile;
function writeToFile(filePath, data) {
    return q.Promise(function (resolve, reject) {
        fs.writeFile(filePath, data, { encoding: "utf8" }, function (error) {
            if (error) {
                reject(error);
            }
            else {
                resolve(null);
            }
        });
    });
}
exports.writeToFile = writeToFile;
function writeToFileSync(filePath, data) {
    try {
        fs.writeFileSync(filePath, data, { encoding: "utf8" });
    }
    catch (err) {
        if (err.code === "ENOENT") {
            // File doesn't exist
            return;
        }
        throw err;
    }
}
exports.writeToFileSync = writeToFileSync;
function appendToFile(filePath, data) {
    return q.Promise(function (resolve, reject) {
        fs.appendFile(filePath, data, { encoding: "utf8" }, function (error) {
            if (error) {
                reject(error);
            }
            else {
                resolve(null);
            }
        });
    });
}
exports.appendToFile = appendToFile;
function deleteFile(filePath) {
    return q.Promise(function (resolve, reject) {
        fs.unlink(filePath, function (error) {
            if (error) {
                reject(error);
            }
            else {
                resolve(null);
            }
        });
    });
}
exports.deleteFile = deleteFile;
/**
 * Renames the given file to a different path/name.
 *
 * Note: The destination will be overwritten without asking if it already exists
 */
function renameFile(oldFilePath, newFilePath) {
    return q.Promise(function (resolve, reject) {
        fs.rename(oldFilePath, newFilePath, function (error) {
            if (error) {
                reject(error);
            }
            else {
                resolve(null);
            }
        });
    });
}
exports.renameFile = renameFile;
function replaceAllStringsInFileSync(filePath, origString, destString) {
    var encoding = "utf8";
    if (!pathExistsSync(filePath)) {
        return;
    }
    var fileContent = fs.readFileSync(filePath, encoding);
    fileContent = fileContent.replace(origString, destString);
    fs.writeFileSync(filePath, fileContent, {
        encoding: encoding
    });
}
exports.replaceAllStringsInFileSync = replaceAllStringsInFileSync;
function deleteFileIfExistsSync(filePath) {
    try {
        fs.unlinkSync(filePath);
    }
    catch (err) {
        if (err.code === "ENOENT") {
            // File doesn't exist
            return;
        }
        throw err;
    }
}
exports.deleteFileIfExistsSync = deleteFileIfExistsSync;
function pathExistsSync(filePath) {
    try {
        fs.statSync(filePath);
        return true;
    }
    catch (err) {
        if (err.code === "ENOENT") {
            // File doesn't exist
            return false;
        }
        throw err;
    }
}
exports.pathExistsSync = pathExistsSync;
function readJsonFileSync(filePath) {
    try {
        var json = fs.readFileSync(filePath, "utf8");
        if (!!json) {
            return JSON.parse(json);
        }
        else {
            return null;
        }
    }
    catch (err) {
        if (err.code === "ENOENT") {
            // File doesn't exist
            return null;
        }
        throw err;
    }
}
exports.readJsonFileSync = readJsonFileSync;

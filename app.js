const fs = require("fs");
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

app.get("*", (req, res) => {
  const basePath = __dirname + "/www/";
  const filePath = `${basePath}${req.path}`;

  const basePrivatePath = __dirname + "/www-private/";
  const filePrivatePath = `${basePrivatePath}${req.path}`;

  const notAuhtenticatedPath = `${basePath}not-authenticated.html`;
  const notFoundPath = `${basePath}404.html`;

  const isFileInPublicFolder = fs.existsSync(filePath);
  const isFileInPrivateFolder = fs.existsSync(filePrivatePath);
  const isAuthenticated =
    req.query.password === "123456" ||
    (req.cookies && req.cookies.authenticated);

  if (isFileInPublicFolder) {
    res.status(200);
    res.sendFile(filePath);
    return;
  }

  if (isFileInPrivateFolder && isAuthenticated) {
    const queryCookieDuration = +req.query.maxAge;
    const cookieAge = queryCookieDuration || 1000 * 60 * 15; // 15 minutes

    res.status(200);
    res.cookie("authenticated", "true", {
      maxAge: cookieAge,
      httpOnly: true,
    });
    res.sendFile(filePrivatePath);
    return;
  }

  if (isFileInPrivateFolder && !isAuthenticated) {
    res.status(403);
    res.sendFile(notAuhtenticatedPath);
    return;
  }

  res.status(404);
  res.sendFile(notFoundPath);
});

module.exports = app;
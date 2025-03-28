const express = require('express');

module.exports = function(app) {
  app.use('/videos', express.static('public/videos', {
    setHeaders: (res, path) => {
      if (path.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
      }
    }
  }));
};
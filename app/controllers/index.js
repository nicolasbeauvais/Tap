'use strict';

var Tap = {};

// Properties
Tap.tiles = {};
Tap.gameLoopTimer = null;
Tap.tileLoopTimer = null;
Tap.start = null;
Tap.score = 0;

Tap.draw = function () {

    var y, x, tile, label;

    for (y = 0; y < 5; y++) {

        for (x = 0; x < 5; x++) {

            tile = $.UI.create('View', {
                id: y + '' + x,
                top: (parseInt(Alloy.Globals.ui.grid) + 80) * y + 185,
                left: (parseInt(Alloy.Globals.ui.grid) + 80) * x + 25,
                classes: ['tap'],
                clicked: false
            });

            label = $.UI.create('Label', {
                text: '',
                touchEnabled: false
            });

            tile.add(label);

            $.grid.add(tile);

            Tap.tiles[tile.id] = tile;
        }
    }
};

Tap.init = function () {

    var tile;

    $.gameOver.setHeight(0);

    // Draw
    Tap.draw();

    // Start the count
    Tap.start = Tap.now();

    // Activate the first tile
    Tap.activateRandomTile();

    // Game loop
    Tap.gameLoopTimer = setInterval(Tap.loop, 100);
    Tap.tileLoopTimer = setInterval(Tap.activateRandomTile, 20000);

    // Events
    for (tile in Tap.tiles) {

        if (!Tap.tiles.hasOwnProperty(tile)) { continue; }

        Tap.tiles[tile].addEventListener('click', Tap.tap);
    }

    $.retry.addEventListener('click', Tap.restart);
};

Tap.restart = function () {

    // Reset Property
    Tap.tiles = {};
    Tap.gameLoopTimer = null;
    Tap.start = null;
    Tap.score = 0;

    // Remove all grid elements
    Tap.removeChildren($.grid);

    // Remove all events listener
    $.retry.removeEventListener('click', Tap.restart);

    // Hide game over and display grid
    $.grid.setHeight(Ti.UI.SIZE);
    $.gameOver.setHeight(0);

    Tap.init();
};

Tap.loop = function () {

    Titanium.API.debug('Loop ==========>');

    var now, duration, m, s, tiles, keys, keysLength;

    now = Tap.now();

    duration = new Date((now - Tap.start) * 1000);
    m = duration.getMinutes() < 10 ? '0' + duration.getMinutes() : duration.getMinutes();
    s = duration.getSeconds() < 10 ? '0' + duration.getSeconds() : duration.getSeconds();

    $.clock.setText(m + ':' + s);
    $.score.setText(Tap.score);

    tiles = Tap.getTilesByProperty('activated', true);
    keys = Object.keys(tiles);
    keysLength = keys.length - 1;

    for (keysLength; keysLength >= 0; keysLength--) {
        Titanium.API.debug('For => ' + keys[keysLength]);
        Tap.checkTile(keys[keysLength], now);
    }
};

Tap.checkTile = function (tileId, now) {

    var elem, duration;

    elem = Tap.tiles[tileId];

    duration = Math.floor(elem.time.end - now);

    // Game over :(
    if (duration < -1) {

        Tap.gameOver();
        return;
    }

    // Do the countdown
    if (duration > 0) {

        Tap.addTextToTile(tileId, duration);
        return;
    }

    // Display Tap!
    if (duration == 0 && !elem.waiTap) {

        Tap.tiles[tileId].waiTap = true;

        Ti.Media.vibrate([0, 200]);
        Tap.addTextToTile(tileId, 'Tap');
        Tap.style('tap', tileId);
    }

    // Reactive tile
    if (elem.tap) {
        Tap.reactivateTile(tileId);
    }
};

Tap.tap = function (data) {

    var elem = Tap.tiles[data.source.id];

    if (!elem.activated) { return; }

    // To soon, game over
    if (elem.time.end > Tap.now()) {

        Tap.gameOver();
        return;
    }

    Tap.tiles[data.source.id].tap = true;
    Tap.score++;
};

Tap.reactivateTile = function (tileId) {

    var now, duration;

    now = Tap.now();
    duration =  Math.floor(Math.random() * 5 + 3);

    Tap.style('wait', tileId);
    Tap.tiles[tileId].activated = true;
    Tap.tiles[tileId].tap = false;
    Tap.tiles[tileId].waiTap = false;
    Tap.tiles[tileId].time = {
        start: now,
        end: now + duration
    };

    Tap.addTextToTile(tileId, duration);
};

Tap.activateRandomTile = function () {

    var tiles, tileId, keys, now, duration;

    tiles = Tap.getTilesByProperty('activated', false);
    keys = Object.keys(tiles);

    if (!tiles) { return; }

    var rand = Math.floor((keys.length - 1) * Math.random());
    tileId = keys[rand];
    now = Tap.now();
    duration =  Math.floor(Math.random() * 5 + 3);

    Tap.style('wait', tileId);
    Tap.tiles[tileId].activated = true;
    Tap.tiles[tileId].tap = false;
    Tap.tiles[tileId].waiTap = false;
    Tap.tiles[tileId].time = {
        start: now,
        end: now + duration
    };

    Tap.addTextToTile(tileId, duration);
};

Tap.getTilesByProperty = function (property, value) {

    var tile, tilesToReturn;

    tilesToReturn = {};

    for (tile in Tap.tiles) {

        if (!Tap.tiles[tile][property] === value) { continue; }

        tilesToReturn[tile] = Tap.tiles[tile];
    }

    return tilesToReturn;
};

Tap.now = function () {
    return +(new Date) / 1000 | 0;
};

Tap.style = function (type, tileId) {
    switch (type) {
        case 'wait':
            Tap.tiles[tileId].setBackgroundColor('#EA3C42');
            break;
        case 'tap':
            Tap.tiles[tileId].setBackgroundColor('#3CEA67');
            break;
    }
};

Tap.addTextToTile = function (tileId, text) {

    Tap.tiles[tileId].children[0].setText(text);
};

Tap.gameOver = function () {

    console.log('GAME OVER');

    clearTimeout(Tap.gameLoopTimer);
    clearTimeout(Tap.tileLoopTimer);

    // Hide grid and display game over
    $.grid.setHeight(0);
    $.gameOver.setHeight(Ti.UI.SIZE);

};

Tap.removeChildren = function (elem) {

    var i;

    for (i in elem.children) {

        var child = elem.children[0];

        Tap.removeChildren(child);
        elem.remove(child);

        child = null;
    }
};

Tap.init();

$.index.open();

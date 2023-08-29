/// <reference types="@mapeditor/tiled-api" />
/*
MIT License

Copyright (c) 2023 Grif_on

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

//Intended for use in Tiled 1.8.6

let map
let scriptPathName = __filename;

let layerName = "All D' objects";

const placeAllDObjects = tiled.registerAction("Place All D' objects", function () {
    map = tiled.activeAsset;

    let layerOfAllObjects = new ObjectGroup(layerName);
    map.insertLayerAt(0, layerOfAllObjects);

    let multiplier = 4.5;

    let horizontalSize = 320 * multiplier;
    let stepX = 18 * multiplier;
    let stepY = 24 * multiplier;

    let currentX = 18 * multiplier;
    let currentY = 16 * multiplier;

    let textFileWithObjectTypes = new TextFile("ext:autogenerated_object_list.txt");
    let arrayOfStrings = textFileWithObjectTypes.readAll().split("\n");
    arrayOfStrings.forEach(function (type, index, array) {

        let current_object = new MapObject(MapObject.Point);
        current_object.type = type;
        current_object.x = currentX;
        current_object.y = currentY;
        //current_object.name = name;
        layerOfAllObjects.addObject(current_object);

        currentX += stepX;

        if (currentX > horizontalSize) {
            currentX = stepX;
            currentY += stepY;
        }

    });

})

placeAllDObjects.text = "Place All D' objects"
placeAllDObjects.icon = "pado.png"

tiled.extendMenu("Edit", [
    { action: "Place All D' objects", before: "SelectAll" },
    { separator: true }
]);
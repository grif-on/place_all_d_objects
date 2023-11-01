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

    ////Note - __filename only available when script is initialized
    //let scriptName = FileInfo.fileName(scriptPathName);
    //let globalScriptsPath = tiled.extensionsPath;
    //let globalTiledPath = globalScriptsPath.slice(0, globalScriptsPath.lastIndexOf("/"));
    let selectedMapPathName = map.fileName;

    //tiled.log("scriptPathName = " + scriptPathName);
    //tiled.log("scriptName = " + scriptName);
    //tiled.log("globalScriptsPath = " + globalScriptsPath);
    //tiled.log("globalTiledPath = " + globalTiledPath);
    tiled.log("selectedMapPathName = " + selectedMapPathName);

    let gameLocalAppdataPath = selectedMapPathName.split("/maps/")[0];
    tiled.log("localAppdataPath = " + gameLocalAppdataPath);

    if (!File.exists(gameLocalAppdataPath + "/autogenerated_object_list.txt")) {
        let message = "\
It seems that you don't have an object list file . \n\
To fix this : \n\
First - you need to generate \"autogenerated_object_list.txt\" inside the game . \
Open D'LIRIUM , then press F3 (or ~) , after that type command \"object list\" and hit enter . \
The game should tell you (in a pop-up window) that it has saved the object list . \n\
Second - make sure that you are running the script on a map that is already saved in the \"%localappdata%\\delirium\\maps\\\" folder .";
        tiled.log("\n\n" + message + "\n\n");
        tiled.alert(message, "Can't find \"autogenerated_object_list.txt\" !");
        return;
    }

    map.macro("Place All D' objects", function () {

        let layerOfAllObjects = new ObjectGroup(layerName);
        map.insertLayerAt(0, layerOfAllObjects);

        let multiplier = 4.5;

        let horizontalSize = 320 * multiplier;
        let stepX = 18 * multiplier;
        let stepY = 24 * multiplier;

        let currentX = 18 * multiplier;
        let currentY = 16 * multiplier;

        let textFileWithObjectTypes = new TextFile(gameLocalAppdataPath + "/autogenerated_object_list.txt");
        let arrayOfStrings = textFileWithObjectTypes.readAll().split("\n");
        textFileWithObjectTypes.close();
        layerOfAllObjects.setProperty("All objects from game version", arrayOfStrings[0]);

        arrayOfStrings = arrayOfStrings.slice(13/*from 13 line to the end of the array*/);

        if (tiled.confirm("Do you want objects to be sorted in alphabetical order .\n(Chose \"No\" to keep original object list order)", "Sort ?")) {
            arrayOfStrings.sort();
        }

        arrayOfStrings.forEach(function (type, index, array) {

            let current_object;
            switch (type) {

                //Always rectangles

                case "obj_doorwall":
                case "obj_cyclerwall":
                case "obj_cyclerwall_solid":
                case "ent_forceload_area":
                case "ent_forceload_type":
                case "ent_trigger":
                case "obj_trigger_secret":
                case "obj_checkbox":
                case "obj_wall":
                case "obj_halfwall":
                case "obj_voidwall":
                case "obj_material_bog":
                case "obj_material_carpet":
                case "obj_material_concrete":
                case "obj_material_grass":
                case "obj_material_lattice":
                case "obj_material_metal":
                case "obj_material_rubber":
                case "obj_material_snow":
                case "obj_material_wood":
                    current_object = new MapObject(MapObject.Rectangle);
                    current_object.height = 32;
                    current_object.width = 32;
                    current_object.x = currentX - 16;
                    current_object.y = currentY - 16;
                    break;

                //Usually points

                default:
                    current_object = new MapObject(MapObject.Point);
                    current_object.x = currentX;
                    current_object.y = currentY;
                    break;
            }

            switch (type) {

                //Adjusting (overriding) properties

                case "obj_buttonLanguage_BY":
                case "obj_buttonLanguage_CN":
                case "obj_buttonLanguage_CZ":
                case "obj_buttonLanguage_DE":
                case "obj_buttonLanguage_ES":
                case "obj_buttonLanguage_FR":
                case "obj_buttonLanguage_GB":
                case "obj_buttonLanguage_HG":
                case "obj_buttonLanguage_PL":
                case "obj_buttonLanguage_RU":
                case "obj_buttonLanguage_TW":
                case "obj_buttonLanguage_UA":
                case "obj_patreon_button":
                case "obj_discord_button":
                    current_object.type = type;
                    current_object.setProperty("image_xscale", 0.1);
                    current_object.setProperty("image_yscale", 0.1);
                    break;
                case "obj_nightmarishMass":
                    current_object.type = type;
                    current_object.setProperty("goBack", true);
                    break;

                //Game cores

                case "obj_gamecontroller":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "MAIN GAME CORE");
                    current_object.setProperty("_note_02_", "Do not spawn or destroy !");
                    break;
                case "obj_controller":
                case "obj_FightSystem":
                case "obj_scriptedSequence":
                case "obj_dev_controller_bot":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Secondary game core .");
                    current_object.setProperty("_note_02_", "Do not spawn or destroy !");
                    break;
                case "obj_Cursor":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Just a singleton .");
                    current_object.setProperty("_note_02_", "Unpredictable behaviour when spawned or destroyed .");
                    break;

                //Game menus

                case "obj_saveMenu":
                case "obj_workshop":
                case "obj_workshop_button":
                case "obj_Menu":
                case "obj_pause":
                case "obj_dev_gameconsole":
                case "obj_helpmenu":
                case "obj_totalstats":
                case "obj_langbutton":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Game menu .");
                    current_object.setProperty("_note_02_", "Unpredictable behaviour when spawned or destroyed .");
                    break;
                case "obj_langbuttonMenu": //todo - перепроверить
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Game menu .");
                    current_object.setProperty("_note_02_", "Unpredictable behaviour when spawned or destroyed .");
                    break;

                //Actually usefull harcoded cinematics

                case "obj_gamelogo":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "You can actually use it , it's OFF only for convinience .");
                    current_object.setProperty("_note_02_", "After appearing on level this object will trigger splash screen cutscene and destroy itself .");
                    current_object.setProperty("_note_03_", "You can set your own custom splash screen with \"logo.jpg\" in your custommap resourceses folder .");
                    current_object.setProperty("_note_04_", "(i.e. if your map named \"example_map.tmj\" then create near it \"example_map\" folder and place \"logo.jpg\" in this folder)");
                    break;

                // Useless harcoded cinematics

                case "obj_cutscene_logo":
                case "obj_disclaimer":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Hardcoded cinematic .");
                    current_object.setProperty("_note_02_", "For animation it is recomended to use ent_cinematic and ent_sound instead .");
                    break;
                case "obj_levelStats":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Hardcoded cinematic .");
                    current_object.setProperty("_note_02_", "For animation it is recomended to use ent_cinematic and ent_sound instead .");
                    current_object.setProperty("_note_03_", "You should use \"arcade_finish\" global variable to properly finish level !");
                    break;
                case "obj_deathScreen":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Hardcoded cinematic .");
                    current_object.setProperty("_note_02_", "For animation it is recomended to use ent_cinematic and ent_sound instead .");
                    current_object.setProperty("_note_03_", "You should use \"ent_hurt\" to properly kill player !");
                    break;
                case "obj_rip":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Hardcoded necrolog .");
                    current_object.setProperty("_note_02_", "Please don't use it .");
                    break;

                //Parents

                case "obj_item":
                    current_object.type = type;
                    current_object.setProperty("_note_01_", "Parent object of all items .");
                    current_object.setProperty("_note_02_", "it's actually spawnable , but it did't do anything usefull . Or is it :)");
                    current_object.setProperty("_note_03_", "Main purpose of it - to help you sort(select) all items .");
                    current_object.setProperty("_note_04_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_key":
                    current_object.type = type;
                    current_object.setProperty("_note_01_", "Parent object of all keys .");
                    current_object.setProperty("_note_02_", "it's actually spawnable and used for creating you own custom keys .");
                    current_object.setProperty("_note_03_", "Additional purpose of it - to help you sort(select) all keys .");
                    current_object.setProperty("_note_04_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_pickable":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all items and keys .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all items and keys .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_NPC":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all NPCs .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all NPCs .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_enemy_base":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object for all enemies and NPCs .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all NPCs .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_enemy":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object for common ground and flying enemies .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all common ground and flying enemies .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_enemy_walking":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object for common ground only enemies .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all common ground only enemies .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_enemy_flying":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object for common flying only enemies .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all common flying only enemies .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_languageButtons":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all languge buttons .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all language buttons .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_window":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all classical windows .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all classical windows .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_dev_lamps":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all classical light sources .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all classical light sources .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_dev_materials":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all materials .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all materials .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_illusionary":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all classical illusionary .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all classical illusionary .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_cycler":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all classical cyclers .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all classical cyclers .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_interact":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all classical interacts .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all classical interacts .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_world":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all objects that are take place in pathfinding .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all objects that are take place in pathfinding .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_projectile":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all player and all enemies projectiles .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all player and all enemies projectiles .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_enemyProjectile":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all enemies projectiles .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all enemies projectiles .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_weaponProjectile":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all (mellee and ranged) player projectiles .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all (mellee and ranged) player projectiles .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_rangedProjectile":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all ranged player projectiles (except obj_Shaft).");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all ranged player projectiles (except obj_Shaft).");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    current_object.setProperty("_note_06_", "obj_Shaft is excluded due to his different behavior (unlike obj_rangedProjectile , obj_Shaft can pass through some objects) .");
                    break;
                case "obj_meleeProjectile":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all melee player projectiles .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all melee player projectiles .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;
                case "obj_entity":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Abstract parent object of all entitites .");
                    current_object.setProperty("_note_02_", "Do not spawn !");
                    current_object.setProperty("_note_03_", "it's an \"abstract class\" .");
                    current_object.setProperty("_note_04_", "Usefull only for sorting(selecting) all entities (this is what !Entity are represent) .");
                    current_object.setProperty("_note_05_", "You can use command \"parent list\" to generate \"autogenerated_hierarchy_list.txt\" .");
                    break;

                //Misc

                case "_entiline_path":
                case "_entiline_programmation":
                case "_entiline_manipulation":
                case "_entiline_activation":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "Ancillary object .");
                    current_object.setProperty("_note_02_", "In game selfdeletes after creation .");
                    current_object.setProperty("_note_03_", "Only needed to suppress custommap loader false-positive errors .");
                    break;

                //"just because"

                case "obj_monster_lantern":
                    current_object.type = "!!!OFF!!!" + type;
                    current_object.setProperty("_note_01_", "OFF just because any lanter on \"level start\" automatically enables \"dark lightmap\" for level (i.e. global value level_lantern = true) .");
                    break;

                //ALL OTHERS

                default:
                    current_object.type = type;
                    break;
            }

            //current_object.name = name;
            layerOfAllObjects.addObject(current_object);

            currentX += stepX;

            if (currentX > horizontalSize) {
                currentX = stepX;
                currentY += stepY;
            }

        });

    });

    if (tiled.confirm("Would you also like to execute a \"Convert types from DEV to PRETTY\" action ?\n(Recomended is \"Yes\")\nIf you chose \"No\" then you can always run it manually from \"Map\" menu .", "Prettify ?")) {
        tiled.trigger("devToPretty");
    }

})

placeAllDObjects.text = "Place All D' objects"
placeAllDObjects.icon = "pado.png"

tiled.extendMenu("Map", [
    { separator: true },
    { action: "Place All D' objects", before: "AutoMap" },
    { separator: true }
]);
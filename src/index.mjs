import { SkyMass } from "@skymass/skymass";
import { loadWordList } from "./utils/wordListLoader.mjs";
import { setupWordlePage } from "./ui/pages/WordlePage.mjs";

// Initialize SkyMass
const sm = new SkyMass({ key: process.env["SKYMASS_KEY"] });

// Load word list
const wordList = loadWordList('word_list.txt');

// Setup the Wordle game page
setupWordlePage(sm, wordList);
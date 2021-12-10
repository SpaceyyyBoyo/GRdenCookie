if(GRden === undefined) var GRden= {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js');
GRden.name = 'GRden';
GRden.version = '3.1';
GRden.GameVersion = '2.031';

GRden.launch = function() {	
	GRden.init = function() {
		GRden.isLoaded = 1;
		GRden.RandomizeAge();
		GRden.ReplaceGardenLocks();
		
		if (Game.prefs.popups) Game.Popup('GRdenCookie v' + GRden.version + ' loaded!');
		else Game.Notify('GRden Cookie!','GRdenCookie v' + GRden.version + ' loaded!', [2, 27] , 1, 1);
		
    		if (Game.prefs.popups) Game.Popup('Garden Randomized!');
		else Game.Notify('Garden Randomized!', '', '', 1, 1);
	
	}
	
	GRden.RandomizeAge = function() {
		var M = Game.Objects['Farm'].minigame;
		var mTime = [];
		var aTick = [];
		var aRTick = [];
		GRden.pData = new Array(5);
		for (var z = 0; z < GRden.pData.length; z++) {
  			GRden.pData[z] = new Array(34);
		}	

		//Get values of mature, ageTick, and ageTickR from all plants and throw them into an array
		
		var i = 0;
		for(var p in M.plants) {
    			mTime[i] = M.plants[p].matureBase;
			aTick[i] = M.plants[p].ageTick;
			aRTick[i] = M.plants[p].ageTickR;
    			i++;
		}
	
		//Set values of every plant to a random set of values from other plants
	
		for(var p in M.plants) {
    			var arrIndex = Math.ceil(Math.random()*mTime.length - 1);
   			M.plants[p].matureBase = mTime[arrIndex];
			M.plants[p].ageTick= aTick[arrIndex];
			M.plants[p].ageTickR = aRTick[arrIndex];
			GRden.pData[0][M.plants[p].id] = mTime[arrIndex];
			GRden.pData[1][M.plants[p].id] = aTick[arrIndex];
			GRden.pData[2][M.plants[p].id] = aRTick[arrIndex];
			mTime.splice(arrIndex, 1);
			M.computeMatures();
		}
	
		//Random Seed Drop
		
		GRden.pSeeds = [];
		GRden.cSeeds = [];
		var rSeedIndex = Math.ceil(Math.random()*34 - 1);
		for(var j = 0; j < 34; j++) {
    			while(GRden.pSeeds.includes(rSeedIndex)) {
        			rSeedIndex = Math.ceil(Math.random()*34 - 1);
    			}
			GRden.pSeeds[j] = rSeedIndex;
			GRden.pData[3][j] = rSeedIndex;
		}
	}
	
	//RESET SEEDS	

	GRden.reload = function() {
		var M = Game.Objects['Farm'].minigame; 
		for(var i = 0; i < M.plantsById.length; i++) {
			GRden.lockSeed(M.plantsById[i]);
		}
		GRden.cSeeds = [];
		for(var p in M.plants) {
			if(M.plants[p].id == 0) {
				M.plants[p].unlocked = 1;
				GRden.cSeeds[GRden.cSeeds.length] = M.plantsById[0];
				GRden.pData[4][0] = 0;
				if (M.plantsById[0].l) M.plantsById[0].l.classList.remove('locked');
			}
		}
		M.getUnlockedN();
	}	

	//RESET RANDOMIZATIONS AND SEEDS
	
	GRden.reset = function() {
		GRden.RandomizeAge()
		GRden.reload();
	}
	
	//SAVE DATA
	GRden.save = function() {
		return JSON.stringify(GRden.pData);
	}

	GRden.exportSave = function() {
		console.log(JSON.stringify(GRden.pData));
	}

	GRden.load = function(str) {
		GRden.pData = JSON.parse(str);
		GRden.checkPData();
	}
	
	GRden.checkPData = function() {
		var M = Game.Objects['Farm'].minigame;
		for(var p in M.plants) {
			M.plants[p].matureBase = GRden.pData[0][M.plants[p].id];
			M.plants[p].ageTick = GRden.pData[1][M.plants[p].id];
			M.plants[p].ageTickR = GRden.pData[2][M.plants[p].id];
		}
		for(var j = 0; j < 34; j++) {GRden.pSeeds[j] = GRden.pData[3][j];}
		for(var j = 0; j < GRden.pData[4].length; j++) {GRden.cSeeds[j] = M.plantsById[GRden.pData[4][j]];}
	}

	GRden.lockSeed = function(me) {
		if (me.locked) return false;
		me.unlocked=0;
		if (me.l) me.l.classList.add('locked');
		GRden.cSeeds.splice(GRden.cSeeds.indexOf(me), 1)
		return true;
	}
	
	GRden.ReplaceGardenLocks = function() {
		var M = Game.Objects['Farm'].minigame;
		var preEvalScript = "var M = Game.Objects['Farm'].minigame;";

		if(!Game.customMinigame['Farm'].unlockSeed) Game.customMinigame['Farm'].unlockSeed = [];
		CCSE.ReplaceCodeIntoFunction('M.unlockSeed', 'if (me.unlocked) return false;',`
			var M = Game.Objects['Farm'].minigame;
			GRden.rArr = GRden.pSeeds[me.id];
			console.log(me);

			if(!GRden.cSeeds.includes(me)) {
				me.unlocked = 0;
				if (me.l) me.l.classList.add('locked');
			}
			if(M.plantsById[GRden.rArr].unlocked) return false;

			GRden.cSeeds[GRden.cSeeds.length] = M.plantsById[GRden.rArr];
			GRden.pData[4][GRden.cSeeds.length] = GRden.rArr;
		
			M.plantsById[GRden.rArr].unlocked = 1;
			if (M.plantsById[GRden.rArr].l) M.plantsById[GRden.rArr].l.classList.remove('locked');

			M.getUnlockedN();
			Game.Popup('('+M.plantsById[GRden.rArr].name+')<br>Unlocked '+M.plantsById[GRden.rArr].name+' seed.',Game.mouseX,Game.mouseY);
			return false;`,
			-1, preEvalScript);
		M.toRebuild = true;
		M.buildPanel();
			
	}
	Game.registerMod(GRden.name, GRden);
	
}

if(!GRden.isLoaded){
	if(CCSE && CCSE.isLoaded){
		GRden.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(GRden.launch);
	}
}

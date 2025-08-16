const canvas = document.getElementById("gameCanvas"),
	ctx = canvas.getContext("2d"),
	mainMenu = document.getElementById("main-menu"),
	gameOverScreen = document.getElementById("game-over-screen"),
	gameUI = document.getElementById("game-ui"),
	bossUI = document.getElementById("boss-ui"),
	bossHpEl = document.getElementById("boss-hp"),
	baseHpEl = document.getElementById("base-hp"),
	coinsEl = document.getElementById("coins"),
	gameTimeEl = document.getElementById("game-time"),
	difficultyLevelEl = document.getElementById("difficulty-level"),
	shopIcon = document.getElementById("shop-icon"),
	shopModal = document.getElementById("shop-modal"),
	shopList = document.getElementById("shop-list"),
	upgradeModal = document.getElementById("upgrade-modal"),
	upgradeInfoEl = document.getElementById("upgrade-info"),
	upgradeButton = document.getElementById("upgrade-button"),
	sellButton = document.getElementById("sell-button"),
	massUpgradeIcon = document.getElementById("mass-upgrade-icon"),
	massUpgradeModal = document.getElementById("mass-upgrade-modal"),
	massUpgradeList = document.getElementById("mass-upgrade-list"),
	permUpgradesModal = document.getElementById("permanent-upgrades-modal"),
	permUpgradesList = document.getElementById("permanent-upgrades-list"),
	totalEnergyMenuEl = document.getElementById("total-energy-menu"),
	totalEnergyUpgradesEl = document.getElementById("total-energy-upgrades"),
	energyCollectedEl = document.getElementById("energy-collected"),
	ASPECT_RATIO = 16 / 9,
	WORLD_WIDTH = 1920,
	WORLD_HEIGHT = WORLD_WIDTH / ASPECT_RATIO,
	MAX_PARTICLES = 200;
let camera = { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2, zoom: 1 },
	permanentUpgrades = {};
const UPGRADES_CONFIG = [
		{
			id: "startCoins1",
			title: "Fundos Iniciais",
			desc: "Comece cada jogo com 10 moedas extras.",
			cost: 40,
		},
		{
			id: "baseHp1",
			title: "Base Reforçada",
			desc: "Aumenta a vida inicial da base em 10.",
			cost: 60,
		},
		{
			id: "interest",
			title: "Sistema Bancário",
			desc: "Gere 1 moeda de juros para cada 100 que você possuir, a cada 5 segundos.",
			cost: 250,
		},
		{
			id: "towerCostDown",
			title: "Licença de Construtor",
			desc: "Reduz o custo de construção de todas as torres em 1 (mínimo de 1).",
			cost: 400,
		},
		{
			id: "towerRepair",
			title: "Auto-Reparo",
			desc: "Todas as torres regeneram 1 de vida a cada 10 segundos.",
			cost: 300,
		},
		{
			id: "towerMaxHpUp",
			title: "Ligas Reforçadas",
			desc: "Aumenta a vida máxima de todas as torres em 5.",
			cost: 250,
		},
		{
			id: "recycling",
			title: "Programa de Reciclagem",
			desc: "Permite vender torres por 50% de seu custo de construção.",
			cost: 150,
		},
		{
			id: "scavenger",
			title: "Protocolos de Coleta",
			desc: "Inimigos derrotados têm 10% de chance de dropar 1 moeda.",
			cost: 300,
		},
		{
			id: "projDmg1",
			title: "Munição Melhorada (Projétil)",
			desc: "Torres de projétil causam +1 de dano.",
			cost: 50,
		},
		{
			id: "projPierce",
			title: "Projéteis Perfurantes (3 Alvos)",
			desc: "Disparos da torre de projétil atravessam até 3 inimigos.",
			cost: 250,
		},
		{
			id: "rocketDmg1",
			title: "Explosivos Potentes (Foguete)",
			desc: "Torres de foguete causam +1 de dano.",
			cost: 70,
		},
		{
			id: "rocketAoe",
			title: "Explosões Maiores",
			desc: "A área de efeito dos foguetes é 50% maior.",
			cost: 200,
		},
		{
			id: "slowPower",
			title: "Criogenia Avançada (Lentidão)",
			desc: "Torres de lentidão reduzem mais a velocidade inimiga (de 50% para 65%).",
			cost: 180,
		},
		{
			id: "slowVulnerability",
			title: "Campo de Fratura (Lentidão)",
			desc: "Inimigos lentos ficam vulneráveis, recebendo 10% a mais de dano.",
			cost: 350,
		},
		{
			id: "mineStun",
			title: "Minas de Concussão (Mina)",
			desc: "A explosão de Minas Terrestres agora atordoa inimigos sobreviventes por 2s.",
			cost: 220,
		},
		{
			id: "coinGen1",
			title: "Banco Central (Moeda)",
			desc: "Torres de moeda geram +1 moeda.",
			cost: 150,
		},
		{
			id: "coinAura",
			title: "Aura de Riqueza (Moeda)",
			desc: "Torres de moeda aumentam em 25% o dano de torres próximas.",
			cost: 300,
		},
		{
			id: "laserRampUp",
			title: "Cristais de Foco (Laser)",
			desc: "Torres de Laser aumentam seu dano 50% mais rápido.",
			cost: 320,
		},
		{
			id: "railgunCharge",
			title: "Feixe Sobrecarregado (Canhão)",
			desc: "Aumenta o dano do Canhão de Elétrons em 25%.",
			cost: 400,
		},
		{
			id: "conductorNetwork",
			title: "Rede Expandida (Condutora)",
			desc: "Torre Condutora pode se conectar a +1 torre e o buff é 10% mais forte.",
			cost: 380,
		},
	],
	TOWER_TYPES = {
		projectile: {
			name: "Projétil",
			desc: "Dispara projéteis em um único alvo. Longo alcance.",
			cost: 3,
			constructor: (e, t) => new ProjectileTower(e, t),
		},
		rocket: {
			name: "Foguete",
			desc: "Dispara foguetes com dano em área.",
			cost: 5,
			constructor: (e, t) => new RocketTower(e, t),
		},
		slow: {
			name: "Lentidão",
			desc: "Reduz a velocidade dos inimigos em sua área.",
			cost: 6,
			constructor: (e, t) => new SlowTower(e, t),
		},
		coin: {
			name: "Moeda",
			desc: "Gera moedas passivamente.",
			cost: 10,
			constructor: (e, t) => new CoinTower(e, t),
		},
		laser: {
			name: "Laser",
			desc: "Causa dano crescente a um único alvo.",
			cost: 12,
			constructor: (e, t) => new LaserTower(e, t),
		},
		railgun: {
			name: "Canhão",
			desc: "Dispara um raio que perfura todos os inimigos em linha.",
			cost: 20,
			constructor: (e, t) => new RailgunTower(e, t),
		},
		conductor: {
			name: "Condutora",
			desc: "Aumenta a cadência de tiro de torres próximas.",
			cost: 15,
			constructor: (e, t) => new ConductorTower(e, t),
		},
		mine: {
			name: "Mina",
			desc: "Explode ao contato, causando dano em área. Uso único.",
			cost: 5,
			constructor: (e, t) => new LandMine(e, t),
		},
	};
function loadProgress() {
	const e = localStorage.getItem("triangularDefenseProgress");
	e
		? ((permanentUpgrades = JSON.parse(e)),
		  UPGRADES_CONFIG.forEach((e) => {
				void 0 === permanentUpgrades[e.id] && (permanentUpgrades[e.id] = !1);
		  }))
		: ((permanentUpgrades = { energy: 0 }),
		  UPGRADES_CONFIG.forEach((e) => {
				permanentUpgrades[e.id] = !1;
		  })),
		updateEnergyUI();
}
function saveProgress() {
	localStorage.setItem("triangularDefenseProgress", JSON.stringify(permanentUpgrades)),
		updateEnergyUI();
}
function resetProgress() {
	confirm(
		"Você tem certeza que deseja resetar todo o seu progresso? Esta ação é irreversível.",
	) && (localStorage.removeItem("triangularDefenseProgress"), window.location.reload());
}
function updateEnergyUI() {
	(totalEnergyMenuEl.textContent = permanentUpgrades.energy),
		(totalEnergyUpgradesEl.textContent = permanentUpgrades.energy);
}
function openPermanentUpgradesModal() {
	gameState && (gameState.isPaused = !0),
		(permUpgradesList.innerHTML = ""),
		UPGRADES_CONFIG.forEach((e) => {
			const t = permanentUpgrades.energy >= e.cost,
				a = permanentUpgrades[e.id],
				s = document.createElement("div");
			(s.className = "perm-upgrade-item"),
				a && s.classList.add("purchased"),
				!t && !a && s.classList.add("disabled"),
				(s.innerHTML = `<span class="item-title">${e.title}</span><span class="energy-cost">${
					e.cost
				} ⚡</span><div class="item-desc">${e.desc} ${a ? "(Comprado)" : ""}</div>`),
				a || (s.onclick = () => buyPermanentUpgrade(e)),
				permUpgradesList.appendChild(s);
		}),
		(permUpgradesModal.style.display = "block");
}
function buyPermanentUpgrade(e) {
	!permanentUpgrades[e.id] &&
		permanentUpgrades.energy >= e.cost &&
		((permanentUpgrades.energy -= e.cost),
		(permanentUpgrades[e.id] = !0),
		saveProgress(),
		openPermanentUpgradesModal());
}
let gameState,
	playerBase,
	towers,
	enemies,
	projectiles,
	particles,
	visualEffects,
	timers,
	spawnRates,
	enemyHpBonus,
	lastTime,
	mousePos;
function resetGameState() {
	const e = 20 + (permanentUpgrades.baseHp1 ? 10 : 0),
		t = 0 + (permanentUpgrades.startCoins1 ? 10 : 0);
	(gameState = {
		baseHp: e,
		coins: t,
		isPaused: !1,
		gameOver: !1,
		placingTower: null,
		selectedTowerForUpgrade: null,
		difficultyLevel: 0,
		gameTime: 0,
		energyCollectedThisRun: 0,
		animationFrameId: null,
		bossActive: !1,
		bossSpawnedForLevel: -1,
	}),
		(playerBase = new PlayerBase(e)),
		(mousePos = { x: 0, y: 0 }),
		(lastTime = 0),
		(timers = {
			coin: 0,
			spawnBlue: 0,
			spawnYellow: 0,
			spawnPurple: 0,
			spawnHealer: 0,
			spawnKamikaze: 0,
			difficultyScale: 0,
			hpScale: 0,
			interest: 0,
			towerRepair: 0,
		}),
		(spawnRates = { blue: 3, yellow: 5, purple: 10, healer: 3, kamikaze: 6 }),
		(enemyHpBonus = 0),
		(towers = []),
		(enemies = []),
		(projectiles = []),
		(particles = []),
		(visualEffects = []);
}
class PlayerBase {
	constructor(e) {
		(this.x = WORLD_WIDTH / 2),
			(this.y = WORLD_HEIGHT / 2),
			(this.size = 25),
			(this.hp = e),
			(this.maxHp = e);
	}
	draw() {
		(ctx.fillStyle = "#eee"),
			ctx.beginPath(),
			ctx.moveTo(this.x, this.y - this.size),
			ctx.lineTo(this.x - this.size, this.y + this.size),
			ctx.lineTo(this.x + this.size, this.y + this.size),
			ctx.closePath(),
			ctx.fill();
	}
	takeDamage(e) {
		(this.hp -= e), this.hp <= 0 && (gameState.gameOver = !0);
	}
}
class Tower {
	constructor(e, t) {
		(this.x = e),
			(this.y = t),
			(this.level = 1),
			(this.maxLevel = 3),
			(this.damageMultiplier = 1),
			(this.fireRateMultiplier = 1),
			(this.hp = 0),
			(this.maxHp = 0),
			(this.recoil = 0),
			(this.rotation = 0),
			(this.size = 25),
			(this.target = null);
	}
	drawBase() {
		ctx.save(),
			ctx.translate(this.x, this.y),
			ctx.rotate(this.rotation),
			ctx.scale(1 - 0.1 * this.recoil, 1 - 0.1 * this.recoil),
			this.drawShape(),
			ctx.restore();
	}
	drawLevels() {
		for (let e = 0; e < this.level - 1; e++)
			(ctx.fillStyle = 1 === e ? "gold" : "white"),
				ctx.beginPath(),
				ctx.arc(this.x + 10 * e - 5, this.y + 0.7 * this.size, 2, 0, 2 * Math.PI),
				ctx.fill();
	}
	draw() {
		this.drawBase(),
			this.drawLevels(),
			this.recoil > 0 && (this.recoil -= 0.1),
			this.hp < this.maxHp &&
				((ctx.fillStyle = "red"),
				ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2 - 8, this.size, 5),
				(ctx.fillStyle = "green"),
				ctx.fillRect(
					this.x - this.size / 2,
					this.y - this.size / 2 - 8,
					this.size * (this.hp / this.maxHp),
					5,
				));
	}
	takeDamage(e) {
		this.hp -= e;
	}
	getUpgradeCost() {
		return Math.floor(this.baseCost * (this.level + 1));
	}
	tryUpgrade() {
		if (this.level >= this.maxLevel) return;
		const e = this.getUpgradeCost();
		gameState.coins >= e && ((gameState.coins -= e), this.applyUpgrade());
	}
	applyInitialHp(e) {
		(this.hp = e + (permanentUpgrades.towerMaxHpUp ? 5 : 0)), (this.maxHp = this.hp);
	}
	update(e) {
		if (this.target) {
			const e = Math.atan2(this.target.y - this.y, this.target.x - this.x);
			this.rotation = lerpAngle(this.rotation, e, 0.1);
		}
	}
}
class ProjectileTower extends Tower {
	constructor(e, t) {
		super(e, t),
			(this.type = "projectile"),
			(this.color = "#0077b6"),
			(this.baseCost = 3),
			(this.range = 250),
			(this.fireRate = 1),
			(this.damage = 2 + (permanentUpgrades.projDmg1 ? 1 : 0)),
			(this.fireCooldown = 0),
			this.applyInitialHp(5);
	}
	update(e) {
		super.update(e),
			(!this.target ||
				this.target.hp <= 0 ||
				Math.hypot(this.x - this.target.x, this.y - this.target.y) > this.range) &&
				this.findTarget(),
			(this.fireCooldown -= e * this.fireRateMultiplier),
			this.fireCooldown <= 0 && this.shoot();
	}
	findTarget() {
		const e = enemies.filter((e) => Math.hypot(this.x - e.x, this.y - e.y) < this.range);
		this.target =
			e.length > 0
				? e.sort(
						(e, t) =>
							Math.hypot(this.x - e.x, this.y - e.y) - Math.hypot(this.x - t.x, this.y - t.y),
				  )[0]
				: null;
	}
	shoot() {
		if (this.target) {
			(this.recoil = 1), (this.fireCooldown = this.fireRate);
			const e = this.x + Math.cos(this.rotation) * (this.size / 2 + 5),
				t = this.y + Math.sin(this.rotation) * (this.size / 2 + 5);
			projectiles.push(new Projectile(e, t, this.target, this.damage * this.damageMultiplier));
		}
	}
	applyUpgrade() {
		this.level++,
			2 === this.level ? (this.fireRate = 0.7) : 3 === this.level && (this.damage += 1);
	}
	drawShape() {
		(ctx.fillStyle = this.color),
			ctx.beginPath(),
			ctx.arc(0, 0, this.size / 2, 0, 2 * Math.PI),
			ctx.fill(),
			(ctx.fillStyle = "#333"),
			ctx.fillRect(0, -3, this.size / 2 + 5, 6);
	}
}
class RocketTower extends Tower {
	constructor(e, t) {
		super(e, t),
			(this.type = "rocket"),
			(this.color = "#d00000"),
			(this.baseCost = 5),
			(this.range = 180),
			(this.fireRate = 1.5),
			(this.damage = 1 + (permanentUpgrades.rocketDmg1 ? 1 : 0)),
			(this.aoeRadius = 40 * (permanentUpgrades.rocketAoe ? 1.5 : 1)),
			(this.fireCooldown = 0),
			this.applyInitialHp(3);
	}
	update(e) {
		super.update(e),
			(!this.target ||
				this.target.hp <= 0 ||
				Math.hypot(this.x - this.target.x, this.y - this.target.y) > this.range) &&
				this.findTarget(),
			(this.fireCooldown -= e * this.fireRateMultiplier),
			this.fireCooldown <= 0 && this.shoot();
	}
	findTarget() {
		const e = enemies.filter((e) => Math.hypot(this.x - e.x, this.y - e.y) < this.range);
		this.target =
			e.length > 0
				? e.sort(
						(e, t) =>
							Math.hypot(this.x - e.x, this.y - e.y) - Math.hypot(this.x - t.x, this.y - t.y),
				  )[0]
				: null;
	}
	shoot() {
		if (this.target) {
			(this.recoil = 1), (this.fireCooldown = this.fireRate);
			const e = this.x + (Math.cos(this.rotation) * this.size) / 2,
				t = this.y + (Math.sin(this.rotation) * this.size) / 2;
			projectiles.push(
				new Rocket(e, t, this.target, this.damage * this.damageMultiplier, this.aoeRadius),
			);
		}
	}
	applyUpgrade() {
		this.level++,
			2 === this.level
				? ((this.fireRate = 1.1), (this.damage += 0.5))
				: 3 === this.level && (this.range = 220);
	}
	drawShape() {
		(ctx.fillStyle = this.color), ctx.beginPath();
		const e = this.size / 2;
		ctx.moveTo(e, -e / 2),
			ctx.lineTo(e, e / 2),
			ctx.lineTo(-e, 0),
			ctx.closePath(),
			ctx.fill();
	}
}
class LaserTower extends Tower {
	constructor(e, t) {
		super(e, t),
			(this.type = "laser"),
			(this.size = 28),
			(this.color = "#ff00ff"),
			(this.baseCost = 12),
			(this.range = 280),
			(this.baseDamage = 2),
			(this.damageRamp = 1.5 * (permanentUpgrades.laserRampUp ? 1.5 : 1)),
			(this.timeOnTarget = 0),
			this.applyInitialHp(8);
	}
	update(e) {
		super.update(e),
			(!this.target ||
				this.target.hp <= 0 ||
				Math.hypot(this.x - this.target.x, this.y - this.target.y) > this.range) &&
				(this.findTarget(), (this.timeOnTarget = 0)),
			this.target &&
				((this.recoil = 0.5),
				(this.timeOnTarget += e * this.fireRateMultiplier),
				this.target.takeDamage(
					(this.baseDamage + this.timeOnTarget * this.damageRamp) * e * this.damageMultiplier,
				));
	}
	findTarget() {
		const e = enemies.filter((e) => Math.hypot(this.x - e.x, this.y - e.y) < this.range);
		e.length > 0
			? (e.sort((e, t) => t.hp - e.hp), (this.target = e[0]))
			: (this.target = null);
	}
	draw() {
		super.draw(),
			this.target &&
				(ctx.beginPath(),
				ctx.moveTo(this.x, this.y),
				ctx.lineTo(this.target.x, this.target.y),
				(ctx.strokeStyle = this.color),
				(ctx.lineWidth = 1 + this.timeOnTarget),
				ctx.stroke());
	}
	applyUpgrade() {
		this.level++,
			2 === this.level ? (this.baseDamage = 3) : 3 === this.level && (this.damageRamp *= 1.5);
	}
	drawShape() {
		ctx.fillStyle = this.color;
		const e = this.size / 2;
		ctx.beginPath(),
			ctx.moveTo(0, -e),
			ctx.lineTo(e, 0),
			ctx.lineTo(0, e),
			ctx.lineTo(-e, 0),
			ctx.closePath(),
			ctx.fill();
	}
}
class RailgunTower extends Tower {
	constructor(e, t) {
		super(e, t),
			(this.type = "railgun"),
			(this.size = 30),
			(this.color = "#48cae4"),
			(this.baseCost = 20),
			(this.range = 1e3),
			(this.fireRate = 5),
			(this.damage = 25 * (permanentUpgrades.railgunCharge ? 1.25 : 1)),
			(this.fireCooldown = 0),
			this.applyInitialHp(10);
	}
	update(e) {
		(this.fireCooldown -= e * this.fireRateMultiplier),
			this.fireCooldown <= 0 && this.findTargetAndShoot(),
			(this.target = enemies.filter(
				(e) => Math.hypot(this.x - e.x, this.y - e.y) < this.range,
			)[0]),
			super.update(e);
	}
	findTargetAndShoot() {
		(this.fireCooldown = this.fireRate), (this.recoil = 1);
		const e = enemies.filter((e) => Math.hypot(this.x - e.x, this.y - e.y) < this.range);
		e.length > 0 &&
			(e.sort(
				(e, t) =>
					Math.hypot(this.x - e.x, this.y - e.y) - Math.hypot(this.x - t.x, this.y - t.y),
			),
			visualEffects.push(
				new RailgunBeam(this.x, this.y, this.rotation, this.damage * this.damageMultiplier),
			));
	}
	applyUpgrade() {
		this.level++,
			2 === this.level ? (this.fireRate = 4) : 3 === this.level && (this.damage *= 1.5);
	}
	drawShape() {
		ctx.fillStyle = "#333";
		const e = this.size / 2;
		ctx.fillRect(-e / 2, -e, e, 2 * e),
			(ctx.fillStyle = this.color),
			ctx.fillRect(-e / 2 + 2, -e, e - 4, 2 * e - 5);
	}
}
class CoinTower extends Tower {
	constructor(e, t) {
		super(e, t),
			(this.type = "coin"),
			(this.color = "#ffc300"),
			(this.baseCost = 10),
			(this.generationRate = 3),
			(this.generationAmount = 1 + (permanentUpgrades.coinGen1 ? 1 : 0)),
			(this.generationCooldown = 0),
			(this.auraRange = permanentUpgrades.coinAura ? 100 : 0),
			(this.auraBuff = 1.25),
			this.applyInitialHp(7),
			(this.rotation = 0);
	}
	update(e) {
		(this.generationCooldown -= e),
			this.generationCooldown <= 0 &&
				((this.recoil = 1),
				(gameState.coins += this.generationAmount),
				(this.generationCooldown = this.generationRate)),
			(this.rotation += 0.5 * e);
	}
	draw() {
		super.draw(),
			this.auraRange > 0 &&
				(ctx.beginPath(),
				ctx.arc(this.x, this.y, this.auraRange, 0, 2 * Math.PI),
				(ctx.strokeStyle = "rgba(255, 215, 0, 0.3)"),
				(ctx.lineWidth = 2),
				ctx.stroke());
	}
	applyUpgrade() {
		this.level++,
			2 === this.level
				? ((this.hp += 3), (this.maxHp += 3))
				: 3 === this.level && ((this.generationRate = 5), (this.generationAmount += 1));
	}
	drawShape() {
		ctx.save(),
			ctx.rotate(this.rotation),
			(ctx.fillStyle = this.color),
			(ctx.strokeStyle = "#fff"),
			(ctx.lineWidth = 2);
		const e = this.size / 2;
		for (let t = 0; t < 4; t++)
			ctx.rotate(Math.PI / 2),
				ctx.beginPath(),
				ctx.moveTo(0, 0),
				ctx.lineTo(e, e),
				ctx.lineTo(0, 1.5 * e),
				ctx.lineTo(-e, e),
				ctx.closePath(),
				ctx.fill(),
				ctx.stroke();
		ctx.restore();
	}
}
class SlowTower extends Tower {
	constructor(e, t) {
		super(e, t),
			(this.type = "slow"),
			(this.color = "#8338ec"),
			(this.baseCost = 6),
			(this.range = 160),
			(this.slowFactor = permanentUpgrades.slowPower ? 0.35 : 0.5),
			this.applyInitialHp(3),
			(this.pulse = 0);
	}
	update(e) {
		this.pulse = (this.pulse + e) % 1;
	}
	draw() {
		super.draw(),
			ctx.beginPath(),
			ctx.arc(this.x, this.y, this.range, 0, 2 * Math.PI),
			(ctx.strokeStyle = `rgba(131,56,236,${0.2 + 0.3 * this.pulse})`),
			(ctx.lineWidth = 1 + 3 * this.pulse),
			ctx.stroke();
	}
	applyUpgrade() {
		this.level++,
			2 === this.level
				? ((this.hp += 2), (this.maxHp += 2))
				: 3 === this.level && (this.range = 240);
	}
	drawShape() {
		const e = this.size / 2;
		(ctx.fillStyle = this.color), ctx.beginPath();
		for (let t = 0; t < 6; t++)
			ctx.lineTo(e * Math.cos((t * Math.PI) / 3), e * Math.sin((t * Math.PI) / 3));
		ctx.closePath(),
			ctx.fill(),
			(ctx.fillStyle = "rgba(255,255,255,0.8)"),
			ctx.beginPath(),
			ctx.arc(0, 0, e * 0.4 * (1 + 0.2 * Math.sin(2 * this.pulse * Math.PI)), 0, 2 * Math.PI),
			ctx.fill();
	}
}
class LandMine extends Tower {
	constructor(e, t) {
		super(e, t),
			(this.type = "mine"),
			(this.size = 15),
			(this.color = "orange"),
			(this.baseCost = 5),
			(this.damage = 10),
			(this.triggerRadius = 25),
			(this.explosionRadius = 40),
			this.applyInitialHp(1);
	}
	update(e) {
		for (const t of enemies)
			if (this.hp > 0 && Math.hypot(this.x - t.x, this.y - t.y) < this.triggerRadius)
				return void this.explode();
	}
	explode() {
		(this.hp = 0),
			visualEffects.push(new ExplosionVisual(this.x, this.y, this.explosionRadius, "#ff8c00"));
		for (const e of enemies)
			Math.hypot(this.x - e.x, this.y - e.y) < this.explosionRadius &&
				(e.takeDamage(this.damage), permanentUpgrades.mineStun && (e.stunTimer = 2));
		if (particles.length < MAX_PARTICLES)
			for (let e = 0; e < 20; e++) new Particle(this.x, this.y);
	}
	applyUpgrade() {
		this.level++,
			2 === this.level
				? (this.explosionRadius = 55)
				: 3 === this.level && (this.explosionRadius = 70);
	}
	drawShape() {
		(ctx.fillStyle = this.color),
			ctx.beginPath(),
			ctx.arc(0, 0, this.size / 2, 0, 2 * Math.PI),
			ctx.fill(),
			(ctx.fillStyle = "red"),
			ctx.beginPath(),
			ctx.arc(0, 0, this.size / 4, 0, 2 * Math.PI),
			ctx.fill();
	}
}
class ConductorTower extends Tower {
	constructor(e, t) {
		super(e, t),
			(this.type = "conductor"),
			(this.size = 20),
			(this.color = "#ffc300"),
			(this.baseCost = 15),
			(this.linkRange = 150),
			(this.linkLimit = 3 + (permanentUpgrades.conductorNetwork ? 1 : 0)),
			(this.fireRateBuff = 1.5 * (permanentUpgrades.conductorNetwork ? 1.1 : 1)),
			(this.linkedTowers = []),
			this.applyInitialHp(12),
			(this.pulse = 0);
	}
	update(e) {
		(this.pulse = (this.pulse + 2 * e) % 1), this.findLinks();
	}
	findLinks() {
		this.linkedTowers = towers
			.filter(
				(e) =>
					e !== this &&
					!e.isBuffedByConductor &&
					e.fireRateMultiplier &&
					Math.hypot(this.x - e.x, this.y - e.y) < this.linkRange,
			)
			.sort(
				(e, t) =>
					Math.hypot(this.x - e.x, this.y - e.y) - Math.hypot(this.x - t.x, this.y - t.y),
			)
			.slice(0, this.linkLimit);
	}
	draw() {
		super.draw(),
			this.linkedTowers.forEach((e) => {
				ctx.beginPath(),
					ctx.moveTo(this.x, this.y),
					ctx.lineTo(e.x, e.y),
					(ctx.strokeStyle = `rgba(255,195,0,${0.5 + 0.3 * this.pulse})`),
					(ctx.lineWidth = 1 + 2 * this.pulse),
					ctx.stroke();
			});
	}
	drawShape() {
		(ctx.fillStyle = this.color),
			ctx.beginPath(),
			ctx.arc(0, 0, this.size / 2, 0, 2 * Math.PI),
			ctx.fill(),
			(ctx.fillStyle = "white"),
			ctx.beginPath(),
			ctx.arc(0, 0, this.size / 4, 0, 2 * Math.PI),
			ctx.fill();
	}
}
class Enemy {
	constructor(e, t) {
		(this.x = e),
			(this.y = t),
			(this.speed = 100),
			(this.targetedBy = { projectile: 0, rocket: 0 }),
			(this.isSlowed = !1),
			(this.slowFactor = 1),
			(this.stunTimer = 0),
			(this.damageTakenMultiplier = 1),
			(this.damageFlash = 0),
			(this.pulse = Math.random());
	}
	drawBase() {
		(ctx.fillStyle = this.damageFlash > 0 ? "white" : this.color),
			this.drawShape(1 + 0.05 * Math.sin(2 * this.pulse * Math.PI));
	}
	draw() {
		ctx.save(),
			ctx.translate(this.x, this.y),
			this.drawBase(),
			ctx.restore(),
			this.hp < this.maxHp &&
				((ctx.fillStyle = "red"),
				ctx.fillRect(this.x - this.radius, this.y - this.radius - 8, 2 * this.radius, 5),
				(ctx.fillStyle = "green"),
				ctx.fillRect(
					this.x - this.radius,
					this.y - this.radius - 8,
					2 * this.radius * (this.hp / this.maxHp),
					5,
				));
	}
	update(e) {
		(this.pulse += 0.5 * e),
			(this.damageFlash = Math.max(0, this.damageFlash - 3 * e)),
			(this.stunTimer -= e),
			this.stunTimer > 0 || (this.move(e), this.attack());
	}
	move(e) {
		let t = this.speed * this.slowFactor,
			a,
			s;
		if ("base" === this.targetType) (a = playerBase.x), (s = playerBase.y);
		else {
			let e = null,
				t = 1 / 0;
			towers.forEach((a) => {
				const s = Math.hypot(this.x - a.x, this.y - a.y);
				s < t && a.hp > 0 && ((t = s), (e = a));
			}),
				e
					? ((a = e.x), (s = e.y), (this.currentTarget = e))
					: ((a = playerBase.x), (s = playerBase.y), (this.currentTarget = playerBase));
		}
		const i = Math.atan2(s - this.y, a - this.x);
		(this.x += Math.cos(i) * t * e), (this.y += Math.sin(i) * t * e);
	}
	attack() {
		if ("base" === this.targetType) {
			Math.hypot(this.x - playerBase.x, this.y - playerBase.y) <
				this.radius + playerBase.size && (playerBase.takeDamage(this.damage), (this.hp = 0));
		} else
			this.currentTarget &&
				this.currentTarget.hp > 0 &&
				Math.hypot(this.x - this.currentTarget.x, this.y - this.currentTarget.y) <
					this.radius + this.currentTarget.size / 2 &&
				(this.currentTarget.takeDamage(this.damage), (this.hp = 0));
	}
	takeDamage(e) {
		(this.damageFlash = 1),
			(this.hp -= e * this.damageTakenMultiplier),
			this.hp <= 0 &&
				(gameState.energyCollectedThisRun++,
				permanentUpgrades.scavenger && Math.random() < 0.1 && gameState.coins++);
	}
}
class BlueEnemy extends Enemy {
	constructor(e, t) {
		super(e, t),
			(this.radius = 12),
			(this.color = "cyan"),
			(this.hp = 5 + enemyHpBonus),
			(this.maxHp = 5 + enemyHpBonus),
			(this.damage = 1),
			(this.targetType = "base");
	}
	drawShape(e) {
		const t = this.radius * e;
		ctx.beginPath();
		for (let e = 0; e < 6; e++)
			ctx.lineTo(t * Math.cos((e * Math.PI) / 3), t * Math.sin((e * Math.PI) / 3));
		ctx.closePath(), ctx.fill();
	}
}
class YellowEnemy extends Enemy {
	constructor(e, t) {
		super(e, t),
			(this.radius = 12),
			(this.color = "gold"),
			(this.hp = 5 + enemyHpBonus),
			(this.maxHp = 5 + enemyHpBonus),
			(this.damage = 1),
			(this.targetType = "tower");
	}
	drawShape(e) {
		const t = this.radius * e;
		ctx.beginPath();
		for (let e = 0; e < 6; e++)
			ctx.lineTo(t * Math.cos((e * Math.PI) / 3), t * Math.sin((e * Math.PI) / 3));
		ctx.closePath(), ctx.fill();
	}
}
class PurpleEnemy extends Enemy {
	constructor(e, t) {
		super(e, t),
			(this.radius = 15),
			(this.color = "purple"),
			(this.hp = 10 + enemyHpBonus),
			(this.maxHp = 10 + enemyHpBonus),
			(this.damage = 2),
			(this.targetType = "base"),
			(this.speed = 80);
	}
	drawShape(e) {
		const t = this.radius * e;
		ctx.beginPath();
		for (let e = 0; e < 6; e++)
			ctx.lineTo(t * Math.cos((e * Math.PI) / 3), t * Math.sin((e * Math.PI) / 3));
		ctx.closePath(), ctx.fill();
	}
}
class HealerEnemy extends Enemy {
	constructor(e, t) {
		super(e, t),
			(this.radius = 14),
			(this.color = "limegreen"),
			(this.hp = 15 + enemyHpBonus),
			(this.maxHp = 15 + enemyHpBonus),
			(this.damage = 0),
			(this.targetType = "base"),
			(this.speed = 70),
			(this.healRadius = 150),
			(this.healCooldown = 1),
			(this.healAmount = 1);
	}
	update(e) {
		super.update(e),
			(this.healCooldown -= e),
			this.healCooldown <= 0 &&
				(enemies.forEach((e) => {
					e !== this &&
						e.hp > 0 &&
						e.hp < e.maxHp &&
						Math.hypot(this.x - e.x, this.y - e.y) < this.healRadius &&
						(e.hp = Math.min(e.maxHp, e.hp + this.healAmount));
				}),
				(this.healCooldown = 1));
	}
	draw() {
		super.draw(),
			ctx.beginPath(),
			ctx.arc(this.x, this.y, this.healRadius, 0, 2 * Math.PI),
			(ctx.strokeStyle = "rgba(0,255,0,0.2)"),
			(ctx.lineWidth = 3),
			ctx.stroke();
	}
	drawShape(e) {
		const t = this.radius * e;
		ctx.beginPath(), ctx.arc(0, 0, t, 0, 2 * Math.PI), ctx.fill(), (ctx.fillStyle = "white");
		const a = 0.6 * t;
		ctx.fillRect(-a / 2, -2, a, 4), ctx.fillRect(-2, -a / 2, 4, a);
	}
}
class KamikazeEnemy extends Enemy {
	constructor(e, t) {
		super(e, t),
			(this.radius = 10),
			(this.color = "magenta"),
			(this.hp = 3 + enemyHpBonus),
			(this.maxHp = 3 + enemyHpBonus),
			(this.damage = 10),
			(this.targetType = "tower"),
			(this.speed = 180),
			(this.explosionRadius = 60);
	}
	attack() {
		this.currentTarget && this.currentTarget.hp > 0
			? Math.hypot(this.x - this.currentTarget.x, this.y - this.currentTarget.y) <
					this.radius + this.currentTarget.size / 2 && this.explode()
			: (!this.currentTarget || this.currentTarget.hp <= 0) && this.explode();
	}
	explode() {
		(this.hp = 0),
			visualEffects.push(new ExplosionVisual(this.x, this.y, this.explosionRadius, "magenta")),
			towers.forEach((e) => {
				Math.hypot(this.x - e.x, this.y - e.y) < this.explosionRadius &&
					e.takeDamage(this.damage);
			}),
			particles.length < MAX_PARTICLES &&
				Array.from({ length: 30 }, () => new Particle(this.x, this.y, "magenta"));
	}
	drawShape(e) {
		const t = this.radius * e;
		ctx.beginPath();
		for (let e = 0; e < 5; e++)
			ctx.lineTo(
				t * Math.cos((2 * e * Math.PI) / 5 + Math.PI / 2),
				t * Math.sin((2 * e * Math.PI) / 5 + Math.PI / 2),
			);
		ctx.closePath(), ctx.fill();
	}
}
class BossEnemy extends Enemy {
	constructor(e, t) {
		super(e, t),
			(this.radius = 60),
			(this.color = "#333"),
			(this.hp = 500 + 50 * gameState.difficultyLevel),
			(this.maxHp = this.hp),
			(this.damage = 0),
			(this.targetType = "base"),
			(this.speed = 20),
			(this.projectileCooldown = 2),
			(this.phaseThresholds = [0.75, 0.5, 0.25]),
			(this.enraged = !1),
			(this.eyePulse = 0);
	}
	update(e) {
		super.update(e),
			(this.eyePulse = (this.eyePulse + 2 * e) % 1),
			(this.projectileCooldown -= e),
			this.projectileCooldown <= 0 &&
				(towers[Math.floor(Math.random() * towers.length)] &&
					projectiles.push(
						new BossProjectile(
							this.x,
							this.y,
							towers[Math.floor(Math.random() * towers.length)],
						),
					),
				(this.projectileCooldown = this.enraged ? 0.5 : 2));
		const t = this.hp / this.maxHp;
		this.phaseThresholds.length > 0 &&
			t <= this.phaseThresholds[0] &&
			(this.summonMinions(), this.phaseThresholds.shift()),
			!this.enraged && t <= 0.25 && (this.enraged = !0);
	}
	summonMinions() {
		Array.from({ length: 3 }, () => spawnEnemy("healer")),
			Array.from({ length: 5 }, () => spawnEnemy("kamikaze"));
	}
	draw() {
		const e = this.radius;
		(ctx.fillStyle = this.enraged ? "#500" : this.color),
			ctx.fillRect(this.x - e, this.y - e, 2 * e, 2 * e);
		const t = 0.3 * e + 5 * Math.sin(this.eyePulse * Math.PI);
		(ctx.fillStyle = this.enraged ? "#ff4d4d" : "red"),
			ctx.beginPath(),
			ctx.arc(this.x, this.y, t, 0, 2 * Math.PI),
			ctx.fill(),
			this.hp < this.maxHp &&
				((ctx.fillStyle = "red"),
				ctx.fillRect(this.x - this.radius, this.y - this.radius - 12, 2 * this.radius, 8),
				(ctx.fillStyle = "green"),
				ctx.fillRect(
					this.x - this.radius,
					this.y - this.radius - 12,
					2 * this.radius * (this.hp / this.maxHp),
					8,
				));
	}
}
class BossProjectile {
	constructor(e, t, a) {
		(this.x = e),
			(this.y = t),
			(this.target = a),
			(this.speed = 200),
			(this.radius = 10),
			(this.color = "red"),
			(this.damage = 10),
			(this.active = !0),
			(this.rotation = 0);
	}
	update(e) {
		(this.rotation += 5 * e), (!this.target || this.target.hp <= 0) && (this.active = !1);
		if (!this.active) return;
		const t = Math.atan2(this.target.y - this.y, this.target.x - this.x);
		(this.x += Math.cos(t) * this.speed * e),
			(this.y += Math.sin(t) * this.speed * e),
			Math.hypot(this.x - this.target.x, this.y - this.target.y) <
				this.radius + this.target.size / 2 &&
				(this.target.takeDamage(this.damage), (this.active = !1));
	}
	draw() {
		ctx.save(),
			ctx.translate(this.x, this.y),
			ctx.rotate(this.rotation),
			(ctx.fillStyle = this.color),
			ctx.beginPath();
		const e = this.radius;
		ctx.rect(-e / 2, -e / 2, e, e), ctx.fill(), ctx.restore();
	}
}
class Projectile {
	constructor(e, t, a, s) {
		(this.x = e),
			(this.y = t),
			(this.damage = s),
			(this.speed = 400),
			(this.radius = 4),
			(this.color = "lightblue"),
			(this.active = true),
			(this.hitEnemies = []),
			(this.isPiercing = permanentUpgrades.projPierce),
			(this.enemyHit = false);
		const i = Math.atan2(a.y - t, a.x - e);
		(this.dx = Math.cos(i)), (this.dy = Math.sin(i)), (this.target = a), (this.maxPierce = 3);
	}
	update(e) {
		if (!this.active) return;

		// Fora do mundo
		if (this.x < 0 || this.x > WORLD_WIDTH || this.y < 0 || this.y > WORLD_HEIGHT) {
			this.active = false;
			return;
		}

		let moveX, moveY; // Variáveis para manutenção da trajetória antes e depois de acertar

		if ((this.isPiercing && this.enemyHit) || this.target.hp < 1) {
			// Segue em linha reta depois do primeiro acerto ou caso o alvo "morra" antes da hora
			moveX = this.dx * this.speed * e;
			moveY = this.dy * this.speed * e;
		} else {
			// Aqui faz com que o projétil corrija sua coordenada em direção ao alvo
			const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
			moveX = Math.cos(angle) * this.speed * e;
			moveY = Math.sin(angle) * this.speed * e;
		}

		this.x += moveX;
		this.y += moveY;

		// Colisão com inimigos
		enemies.forEach((enemy) => {
			if (
				enemy.hp > 0 &&
				!this.hitEnemies.includes(enemy) &&
				Math.hypot(this.x - enemy.x, this.y - enemy.y) < this.radius + enemy.radius
			) {
				this.onHit(enemy);
				if (this.isPiercing) this.enemyHit = true;
			}
		});
	}

	onHit(e) {
		e.takeDamage(this.damage),
			this.hitEnemies.push(e),
			this.isPiercing && this.hitEnemies.length >= this.maxPierce
				? (this.active = !1)
				: this.isPiercing || (this.active = !1);
	}
	draw() {
		(ctx.fillStyle = this.color),
			ctx.beginPath(),
			ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI),
			ctx.fill();
	}
}
class Rocket extends Projectile {
	constructor(e, t, a, s, i) {
		super(e, t, a, s),
			(this.isPiercing = !1),
			(this.target = a),
			(this.speed = 250),
			(this.radius = 6),
			(this.color = "orangered"),
			(this.aoeRadius = i);
	}
	onHit(e) {
		this.explode(), (this.active = !1);
	}
	explode() {
		visualEffects.push(new ExplosionVisual(this.x, this.y, this.aoeRadius, "orangered")),
			enemies.forEach((e) => {
				Math.hypot(this.x - e.x, this.y - e.y) < this.aoeRadius && e.takeDamage(this.damage);
			}),
			particles.length < MAX_PARTICLES &&
				Array.from({ length: 20 }, () => new Particle(this.x, this.y));
	}
}
class Particle {
	constructor(e, t, a = "orange") {
		(this.x = e),
			(this.y = t),
			(this.size = 5 * Math.random() + 1),
			(this.speedX = 3 * Math.random() - 1.5),
			(this.speedY = 3 * Math.random() - 1.5),
			(this.lifespan = 1),
			(this.color = a);
	}
	update(e) {
		(this.x += this.speedX), (this.y += this.speedY), (this.lifespan -= e);
	}
	draw() {
		(ctx.globalAlpha = this.lifespan > 0 ? this.lifespan : 0),
			(ctx.fillStyle = this.color),
			ctx.beginPath(),
			ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI),
			ctx.fill(),
			(ctx.globalAlpha = 1);
	}
}
class ExplosionVisual {
	constructor(e, t, a, s = "red") {
		(this.x = e),
			(this.y = t),
			(this.radius = 0),
			(this.maxRadius = a),
			(this.lifespan = 0.4),
			(this.color = s);
	}
	update(e) {
		(this.radius = this.maxRadius * (1 - Math.pow(this.lifespan / 0.4, 2))),
			(this.lifespan -= e);
	}
	draw() {
		(ctx.globalAlpha = this.lifespan > 0 ? this.lifespan / 0.4 : 0),
			(ctx.strokeStyle = this.color),
			(ctx.lineWidth = 5),
			ctx.beginPath(),
			ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI),
			ctx.stroke(),
			(ctx.globalAlpha = 1);
	}
}
class RailgunBeam {
	constructor(e, t, a, s) {
		(this.x = e),
			(this.y = t),
			(this.damage = s),
			(this.lifespan = 0.2),
			(this.rotation = a),
			(this.endX = this.x + 2 * Math.cos(this.rotation) * WORLD_WIDTH),
			(this.endY = this.y + 2 * Math.sin(this.rotation) * WORLD_WIDTH),
			(this.hitEnemies = []),
			this.applyDamage();
	}
	applyDamage() {
		enemies.forEach((e) => {
			this.isEnemyOnBeam(e) && (e.takeDamage(this.damage), this.hitEnemies.push(e));
		});
	}
	isEnemyOnBeam(e) {
		return (
			Math.abs(
				(this.endY - this.y) * e.x -
					(this.endX - this.x) * e.y +
					this.endX * this.y -
					this.endY * this.x,
			) /
				Math.hypot(this.endY - this.y, this.endX - this.x) <
			e.radius + 5
		);
	}
	update(e) {
		this.lifespan -= e;
	}
	draw() {
		(ctx.globalAlpha = this.lifespan > 0 ? this.lifespan / 0.2 : 0),
			ctx.beginPath(),
			ctx.moveTo(this.x, this.y),
			ctx.lineTo(this.endX, this.endY),
			(ctx.strokeStyle = "#00b4d8"),
			(ctx.lineWidth = 10),
			ctx.stroke(),
			(ctx.globalAlpha = 1);
	}
}
function startGame() {
	adjustViewport();
	mainMenu.classList.add("hidden"),
		gameOverScreen.classList.add("hidden"),
		canvas.classList.remove("hidden"),
		gameUI.classList.remove("hidden"),
		resetGameState(),
		(lastTime = performance.now()),
		gameLoop(lastTime);
}
function endGame() {
	gameState.animationFrameId &&
		(cancelAnimationFrame(gameState.animationFrameId), (gameState.animationFrameId = null)),
		(permanentUpgrades.energy += gameState.energyCollectedThisRun),
		saveProgress(),
		(energyCollectedEl.textContent = gameState.energyCollectedThisRun),
		canvas.classList.add("hidden"),
		gameUI.classList.add("hidden"),
		gameOverScreen.classList.remove("hidden");
}
function returnToMenu() {
	gameOverScreen.classList.add("hidden"), mainMenu.classList.remove("hidden");
}
function spawnEnemy(e) {
	let t,
		a,
		s = Math.floor(4 * Math.random());
	0 === s
		? ((t = Math.random() * WORLD_WIDTH), (a = -50))
		: 1 === s
		? ((t = WORLD_WIDTH + 50), (a = Math.random() * WORLD_HEIGHT))
		: 2 === s
		? ((t = Math.random() * WORLD_WIDTH), (a = WORLD_HEIGHT + 50))
		: ((t = -50), (a = Math.random() * WORLD_HEIGHT));
	let i;
	"blue" === e
		? (i = new BlueEnemy(t, a))
		: "yellow" === e
		? (i = new YellowEnemy(t, a))
		: "purple" === e
		? (i = new PurpleEnemy(t, a))
		: "healer" === e
		? (i = new HealerEnemy(t, a))
		: "kamikaze" === e && (i = new KamikazeEnemy(t, a)),
		i && enemies.push(i);
}
function spawnBoss() {
	const e = 2 * Math.random() * Math.PI,
		t = WORLD_WIDTH / 2 + 1.8 * Math.cos(e) * WORLD_WIDTH,
		a = WORLD_HEIGHT / 2 + 1.8 * Math.sin(e) * WORLD_HEIGHT;
	enemies.push(new BossEnemy(t, a)),
		(gameState.bossActive = !0),
		bossUI.classList.remove("hidden"),
		(gameState.bossSpawnedForLevel = gameState.difficultyLevel);
}
function lerpAngle(e, t, a) {
	let s = t - e;
	for (s %= 2 * Math.PI; s > Math.PI; ) s -= 2 * Math.PI;
	for (; s < -Math.PI; ) s += 2 * Math.PI;
	return e + s * a;
}
function update(e) {
	Object.keys(timers).forEach((t) => (timers[t] += e)),
		(gameState.gameTime += e),
		gameState.difficultyLevel > 0 &&
			gameState.difficultyLevel % 20 == 0 &&
			!gameState.bossActive &&
			gameState.bossSpawnedForLevel !== gameState.difficultyLevel &&
			spawnBoss(),
		towers.forEach((e) => {
			(e.fireRateMultiplier = 1), (e.isBuffedByConductor = !1);
		}),
		towers.forEach((e) => {
			e instanceof ConductorTower &&
				(e.findLinks(),
				e.linkedTowers.forEach((t) => {
					(t.fireRateMultiplier *= e.fireRateBuff), (t.isBuffedByConductor = !0);
				}));
		}),
		enemies.forEach((e) => {
			(e.targetedBy = { projectile: 0, rocket: 0 }),
				(e.isSlowed = !1),
				(e.slowFactor = 1),
				(e.damageTakenMultiplier = 1);
		}),
		projectiles.forEach((e) => {
			e.target &&
				e.target.hp > 0 &&
				(e instanceof Rocket
					? e.target.targetedBy.rocket++
					: e.target.targetedBy.projectile++);
		}),
		towers.forEach((e) => (e.damageMultiplier = 1)),
		towers.forEach((e) => {
			e instanceof SlowTower &&
				enemies.forEach((t) => {
					Math.hypot(e.x - t.x, e.y - t.y) < e.range &&
						((t.isSlowed = !0),
						(t.slowFactor = Math.min(t.slowFactor, e.slowFactor)),
						permanentUpgrades.slowVulnerability && (t.damageTakenMultiplier = 1.1));
				}),
				e instanceof CoinTower &&
					e.auraRange > 0 &&
					towers.forEach((t) => {
						t !== e &&
							t instanceof Tower &&
							Math.hypot(e.x - t.x, e.y - t.y) < e.auraRange &&
							(t.damageMultiplier = e.auraBuff);
					});
		});
	const t = enemies.find((e) => e instanceof BossEnemy);
	if (gameState.bossActive && t) bossHpEl.textContent = `${Math.ceil(t.hp)}/${t.maxHp}`;
	else {
		bossUI.classList.add("hidden"),
			gameState.bossActive &&
				((gameState.bossActive = !1),
				(gameState.coins += 200),
				(permanentUpgrades.energy += 100 + 5 * gameState.difficultyLevel),
				updateEnergyUI(),
				saveProgress());
		const e = Math.floor(gameState.difficultyLevel / 3) + 1;
		if (timers.coin >= 1) gameState.coins++, (timers.coin = 0);
		if (timers.spawnBlue >= spawnRates.blue) {
			for (let t = 0; t < e; t++) spawnEnemy("blue");
			timers.spawnBlue = 0;
		}
		if (timers.spawnYellow >= spawnRates.yellow) {
			for (let t = 0; t < e; t++) spawnEnemy("yellow");
			timers.spawnYellow = 0;
		}
		if (timers.spawnPurple >= spawnRates.purple) {
			for (let t = 0; t < e; t++) spawnEnemy("purple");
			timers.spawnPurple = 0;
		}
		if (gameState.difficultyLevel >= 10) {
			const t = Math.floor((gameState.difficultyLevel - 10) / 3) + 1;
			if (timers.spawnHealer >= spawnRates.healer) {
				for (let e = 0; e < t; e++) spawnEnemy("healer");
				timers.spawnHealer = 0;
			}
			if (timers.spawnKamikaze >= spawnRates.kamikaze) {
				for (let e = 0; e < t; e++) spawnEnemy("kamikaze");
				timers.spawnKamikaze = 0;
			}
		}
	}
	timers.difficultyScale >= 20 &&
		((spawnRates.blue = Math.max(0.5, spawnRates.blue - 0.7)),
		(spawnRates.yellow = Math.max(1, spawnRates.yellow - 0.7)),
		(spawnRates.purple = Math.max(2, spawnRates.purple - 0.7)),
		gameState.difficultyLevel++,
		(timers.difficultyScale = 0)),
		timers.hpScale >= 60 && (enemyHpBonus++, (timers.hpScale = 0)),
		permanentUpgrades.interest &&
			timers.interest >= 5 &&
			((gameState.coins += Math.floor(gameState.coins / 100)), (timers.interest = 0)),
		permanentUpgrades.towerRepair &&
			timers.towerRepair >= 10 &&
			(towers.forEach((e) => {
				e.hp < e.maxHp && (e.hp = Math.min(e.maxHp, e.hp + 1));
			}),
			(timers.towerRepair = 0)),
		[towers, enemies, projectiles, particles, visualEffects].forEach((t) =>
			t.forEach((t) => t.update(e)),
		),
		(towers = towers.filter((e) => e.hp > 0)),
		(enemies = enemies.filter((e) => e.hp > 0)),
		(projectiles = projectiles.filter((e) => e.active)),
		(particles = particles.filter((e) => e.lifespan > 0)),
		(visualEffects = visualEffects.filter((e) => e.lifespan > 0));
}
function draw() {
	ctx.save(),
		ctx.translate(
			-camera.x * camera.zoom + canvas.width / 2,
			-camera.y * camera.zoom + canvas.height / 2,
		),
		ctx.scale(camera.zoom, camera.zoom),
		(ctx.fillStyle = "#000"),
		ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT),
		playerBase.draw(),
		[visualEffects, towers, enemies, projectiles, particles].forEach((e) =>
			e.forEach((e) => e.draw()),
		);
	const e = mousePos;
	gameState.placingTower &&
		(e.x > 0 &&
			gameState.placingTower.range &&
			(ctx.beginPath(),
			ctx.arc(e.x, e.y, gameState.placingTower.range || 0, 0, 2 * Math.PI),
			(ctx.strokeStyle = "rgba(255,255,255,0.5)"),
			ctx.stroke()),
		e.x > 0 &&
			gameState.placingTower.triggerRadius &&
			(ctx.beginPath(),
			ctx.arc(e.x, e.y, gameState.placingTower.triggerRadius, 0, 2 * Math.PI),
			(ctx.fillStyle = "rgba(255,100,0,0.2)"),
			ctx.fill()),
		(ctx.globalAlpha = 0.6),
		TOWER_TYPES[gameState.placingTower.type].constructor(e.x, e.y).drawBase(),
		(ctx.globalAlpha = 1)),
		gameState.selectedTowerForUpgrade &&
			((ctx.strokeStyle = "gold"),
			(ctx.lineWidth = 3 / camera.zoom),
			ctx.beginPath(),
			ctx.arc(
				gameState.selectedTowerForUpgrade.x,
				gameState.selectedTowerForUpgrade.y,
				gameState.selectedTowerForUpgrade.size,
				0,
				2 * Math.PI,
			),
			ctx.stroke()),
		ctx.restore();
}
function updateUI() {
	(baseHpEl.textContent = `${playerBase.hp}/${playerBase.maxHp}`),
		(coinsEl.textContent = gameState.coins),
		(gameTimeEl.textContent = Math.floor(gameState.gameTime)),
		(difficultyLevelEl.textContent = gameState.difficultyLevel);
}
function gameLoop(e) {
	if (gameState.gameOver) return endGame();
	const t = (e - lastTime) / 1e3 || 0;
	(lastTime = e),
		gameState.isPaused || update(t),
		draw(),
		updateUI(),
		(gameState.animationFrameId = requestAnimationFrame(gameLoop));
}
function closeAllModals() {
	(shopModal.style.display = "none"),
		(upgradeModal.style.display = "none"),
		(massUpgradeModal.style.display = "none"),
		(permUpgradesModal.style.display = "none");
	if (gameState) {
		!gameState.placingTower && (gameState.isPaused = !1),
			(gameState.selectedTowerForUpgrade = null);
	}
}
function getMouseWorldPos(e) {
	const t = canvas.getBoundingClientRect(),
		a = e.touches ? e.touches[0] : e;
	return {
		x: (a.clientX - t.left) / camera.zoom + camera.x - canvas.width / (2 * camera.zoom),
		y: (a.clientY - t.top) / camera.zoom + camera.y - canvas.height / (2 * camera.zoom),
	};
}
function getTowerCost(e) {
	return Math.max(1, e - (permanentUpgrades.towerCostDown ? 1 : 0));
}
function sellTower() {
	if (!gameState.selectedTowerForUpgrade) return;
	const e = Math.floor(0.5 * getTowerCost(gameState.selectedTowerForUpgrade.baseCost));
	(gameState.coins += e),
		(towers = towers.filter((e) => e !== gameState.selectedTowerForUpgrade)),
		closeAllModals();
}
function openShopModal() {
	(gameState.placingTower = null), (gameState.isPaused = !0), (shopList.innerHTML = "");
	for (const e in TOWER_TYPES) {
		const t = TOWER_TYPES[e],
			a = getTowerCost(t.cost),
			s = document.createElement("div");
		(s.className = "shop-item"),
			(s.dataset.type = e),
			(s.innerHTML = `<span class="item-title">${t.name}</span><span class="cost">${a} 🪙</span><div class="item-desc">${t.desc}</div>`),
			shopList.appendChild(s);
	}
	shopModal.style.display = "block";
}
function openUpgradeModal(e) {
	closeAllModals(),
		(gameState.isPaused = !0),
		(gameState.selectedTowerForUpgrade = e),
		e.level >= e.maxLevel
			? ((upgradeInfoEl.innerHTML = "<div>Nível Máximo Atingido!</div>"),
			  (upgradeButton.style.display = "none"))
			: ((upgradeInfoEl.innerHTML = `<div>Nível Atual: ${e.level}</div><div>Próximo Nível: ${
					e.level + 1
			  }</div><div>Custo: <span style="color: gold;">${e.getUpgradeCost()} 🪙</span></div>`),
			  (upgradeButton.style.display = "block"),
			  (upgradeButton.disabled = gameState.coins < e.getUpgradeCost())),
		permanentUpgrades.recycling
			? (sellButton.classList.remove("hidden"),
			  (sellButton.innerHTML = `Vender por ${Math.floor(0.5 * getTowerCost(e.baseCost))} 🪙`))
			: sellButton.classList.add("hidden"),
		(upgradeModal.style.display = "block");
}
function openMassUpgradeModal() {
	closeAllModals(), (gameState.isPaused = !0), (massUpgradeList.innerHTML = "");
	const e = Object.keys(TOWER_TYPES);
	e.forEach((e) => {
		const t = TOWER_TYPES[e],
			a = calculateMassUpgrade(e),
			s = document.createElement("div");
		(s.className = "mass-upgrade-item"),
			a.towers.length > 0
				? ((s.innerHTML = `Melhorar ${a.towers.length} de ${t.name}<span class="cost">${a.cost} 🪙</span>`),
				  s.classList.toggle("disabled", gameState.coins < a.cost),
				  (s.onclick = () => performMassUpgrade(e)))
				: ((s.innerHTML = `Nenhuma de ${t.name} para melhorar`), s.classList.add("disabled")),
			massUpgradeList.appendChild(s);
	}),
		(massUpgradeModal.style.display = "block");
}
function calculateMassUpgrade(e) {
	let t = 0,
		a = [];
	return (
		towers
			.filter((t) => t.type === e && t.level < t.maxLevel)
			.forEach((e) => {
				(t += e.getUpgradeCost()), a.push(e);
			}),
		{ cost: t, towers: a }
	);
}
function performMassUpgrade(e) {
	const { cost: t, towers: a } = calculateMassUpgrade(e);
	t > 0 &&
		gameState.coins >= t &&
		((gameState.coins -= t), a.forEach((e) => e.applyUpgrade())),
		openMassUpgradeModal();
}
function handleShopItemClick(e) {
	const t = e.target.closest(".shop-item");
	if (!t) return;
	const a = t.dataset.type,
		s = TOWER_TYPES[a],
		i = getTowerCost(s.cost);
	gameState.coins >= i
		? ((gameState.placingTower = {
				type: a,
				baseCost: s.cost,
				range: s.constructor(0, 0).range,
				triggerRadius: s.constructor(0, 0).triggerRadius,
		  }),
		  closeAllModals(),
		  (gameState.isPaused = !1))
		: popNotifica("Moedas insuficientes!", false);
}
function handleCanvasClick(e) {
	if (gameState.isPaused) return;
	mousePos = getMouseWorldPos(e);
	if (gameState.placingTower) {
		const e = getTowerCost(gameState.placingTower.baseCost);
		gameState.coins >= e &&
			((gameState.coins -= e),
			towers.push(
				TOWER_TYPES[gameState.placingTower.type].constructor(mousePos.x, mousePos.y),
			)),
			(gameState.placingTower = null);
	} else {
		let e = null;
		for (const t of towers)
			if (Math.hypot(mousePos.x - t.x, mousePos.y - t.y) < t.size) {
				e = t;
				break;
			}
		e && openUpgradeModal(e);
	}
}

function adjustViewport() {
	const e = window.innerWidth,
		t = window.innerHeight;
	let a, s;

	// Calcula o zoom necessário para que o mundo inteiro caiba na tela
	const zoomToFit = Math.min(canvas.width / WORLD_WIDTH, canvas.height / WORLD_HEIGHT);

	e / t > ASPECT_RATIO ? ((s = t), (a = t * ASPECT_RATIO)) : ((a = e), (s = e / ASPECT_RATIO)),
		(canvas.width = a),
		(canvas.height = s),
		// Limita o zoom da câmera a uma faixa de 0.4 a 1.3
		(camera.zoom = Math.max(0.4, Math.min(1.3, zoomToFit)));
}

// Modal pop-up de notificação
function popNotifica(message, success) {
	if (document.querySelector(".pop-notifica")) {
		document.querySelector(".pop-notifica").remove();
	}
	const popDiv = document.createElement("div");
	popDiv.classList.add("pop-notifica");
	popDiv.classList.add(success ? "success" : "error");
	popDiv.textContent = message;
	document.body.appendChild(popDiv);
	setTimeout(() => {
		if (popDiv) popDiv.remove();
	}, 3000);
}

window.addEventListener("resize", () => {
	adjustViewport();
}),
	shopIcon.addEventListener("click", openShopModal),
	massUpgradeIcon.addEventListener("click", openMassUpgradeModal),
	upgradeButton.addEventListener("click", () => {
		gameState.selectedTowerForUpgrade &&
			(gameState.selectedTowerForUpgrade.tryUpgrade(),
			openUpgradeModal(gameState.selectedTowerForUpgrade));
	}),
	shopList.addEventListener("click", handleShopItemClick),
	canvas.addEventListener("click", handleCanvasClick),
	canvas.addEventListener("contextmenu", (e) => {
		e.preventDefault(), gameState.placingTower && (gameState.placingTower = null);
	});
function updateMousePosition(e) {
	gameState && !gameState.isPaused && (mousePos = getMouseWorldPos(e));
}
document.body.addEventListener("mousemove", updateMousePosition),
	document.body.addEventListener(
		"touchmove",
		(e) => {
			gameState && !gameState.isPaused && (e.preventDefault(), updateMousePosition(e));
		},
		{ passive: !1 },
	);
let testModeActivated = !1;
window.addEventListener("keydown", (e) => {
	if ("p" === e.key.toLowerCase()) {
		if (testModeActivated) return;
		UPGRADES_CONFIG.forEach((e) => {
			permanentUpgrades[e.id] = !0;
		}),
			(testModeActivated = !0),
			popNotifica(
				`MODO DE TESTE ATIVADO: Todas as melhorias permanentes foram habilitadas para esta sessão. \n
				O jogo será reiniciado para aplicar as mudanças.`,
				true,
			);
		gameState &&
			gameState.animationFrameId &&
			cancelAnimationFrame(gameState.animationFrameId),
			startGame();
	}
}),
	loadProgress(),
	window.dispatchEvent(new Event("resize")),
	"serviceWorker" in navigator &&
		window.addEventListener("load", () => {
			navigator.serviceWorker.register("./service-worker.js").then(
				(e) => {
					console.log("ServiceWorker registrado com sucesso: ", e.scope);
				},
				(e) => {
					console.log("Falha no registro do ServiceWorker: ", e);
				},
			);
		});

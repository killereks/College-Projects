class Weapon {
	constructor(textures, damage, fireRate, bulletRange, maxBullets, accuracy, reloadTime, bulletsInMag){
		this.damage = damage;
		this.fireRate = fireRate;
		this.bulletRange = bulletRange;
		this.maxBullets = maxBullets;
		this.accuracy = accuracy;
		this.reloadTime = reloadTime;
		this.bulletsInMagazine = bulletsInMag;
		this.textures = textures;
	}
}
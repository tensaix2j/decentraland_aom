


import resources from "src/resources";


export class Txprojectile extends Entity {

	
	public id;
	public parent;


	public dst_v3;
	public src_v3;

	public visible = 1;
	public speed = 0.3;

	public attacktarget;
	public damage;
	public owner;
	
	public type;

	constructor( id, parent , src_v3, dst_v3 , shape , attacktarget ,type , damage , owner ) {

		super();
		engine.addEntity(this);
		this.setParent( parent );

		this.id = id;
		this.parent = parent;
		this.type = type;
		this.attacktarget = attacktarget;
		this.damage = damage;
		this.owner  = owner;

		this.dst_v3 = dst_v3;
		this.src_v3 = src_v3;

		let transform = new Transform({
			position: this.src_v3
		});

		this.addComponent( transform );
		this.addComponent( shape );
		
		this.reinit();
	}


	//--------------
	reinit() {

		//log( "Projectile" , this.id , "reinited" , this.getComponent(Transform).position.y , this.speed ) ;
	}


	//--------------
	move_self( dt ) {
		
		let transform = this.getComponent(Transform);

		let diff_x = this.dst_v3.x -  transform.position.x;
		let diff_z = this.dst_v3.z -  transform.position.z;

    	var hypsqr = diff_x * diff_x + diff_z * diff_z  ;

    	if ( hypsqr > this.speed * this.speed   ) {
    		
    			var rad	 = Math.atan2( diff_x, diff_z );
	    		var deg  = rad * 180.0 / Math.PI ;

	    		var delta_x = this.speed * Math.sin(rad);
	    		var delta_z = this.speed * Math.cos(rad);

	    		transform.position.x += delta_x;
	    		transform.position.z += delta_z;
	    		

	    		// extra
	    		let diff_y = this.dst_v3.y -  transform.position.y;
    			var rad2 = Math.atan2( diff_y, diff_z );
	    		var delta_y = this.speed * Math.sin(rad2);
	    		var deg2    = rad2 * 180.0 / Math.PI;
	    		transform.position.y += delta_y;
	    		
	    		transform.lookAt( this.dst_v3 );

	    } else {

	    	if ( this.type == 1 ) {
	    		// Arrow
		    	if ( this.attacktarget != null && this.attacktarget.dead == 0 ) {
		    		this.inflict_damage();
		    	}
	    	} else if ( this.type == 2 ) {
	    		// Fireball
	    		this.parent.createExplosion( 
	    			new Vector3( transform.position.x , transform.position.y, transform.position.z ), 
	    			this.damage,
	    			this.owner
	    		);
	    	}


	    	this.owner = null;
	    	this.hide();
	    }
	}



	//---
	inflict_damage() {

		if ( this.attacktarget != null ) {
			
			this.attacktarget.curhp -= this.damage;
			if ( this.attacktarget.curhp < 0 ) {
				this.attacktarget.curhp = 0;
			}
			//log( this.type, this.id , "hits " , this.attacktarget.type, this.attacktarget.id , " remaining hp = " , this.attacktarget.curhp , this.attacktarget.maxhp )

			let hp_perc = this.attacktarget.curhp / this.attacktarget.maxhp ;
			this.attacktarget.healthbar.getComponent( Transform ).scale.x = hp_perc * 1.5;
			if ( this.attacktarget.curhp <= 0 ) {
				
				//log( this.type, this.id , " kills " , this.attacktarget.type, this.attacktarget.id );
				this.attacktarget.die();
				this.attacktarget = null;
			}
		}
	}
	

	//----------
	update(dt) {

		this.move_self(dt);
	}

	//-----
	hide() {
		this.visible = 0;
		this.getComponent(Transform).position.y = 999;
		//this.getComponent(GLTFShape).visible = false;

	}

	//---
	show() {
		this.visible = 1;
		//this.getComponent(GLTFShape).visible = true;
	}
}





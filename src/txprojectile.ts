


import resources from "src/resources";


export class Txprojectile extends Entity {

	
	public id;
	public parent;


	public dst_v3;
	public src_v3;

	public visible = 1;
	public speed = 2.5;

	public attacktarget;
	public damage;
	public owner;

	public type;
	public tick = 0;

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
		
	}


	//--------------
	move_self( dt ) {
		
		

		let transform = this.getComponent(Transform);
		let distance = Vector3.DistanceSquared(transform.position, this.dst_v3 ) // Check distance squared as it's more optimized

    	if (distance > this.speed * this.speed * dt * dt ) {

    		let direction = this.dst_v3.subtract(transform.position)
		    transform.rotation = Quaternion.LookRotation(direction)

    		let forwardVector = Vector3.Forward().rotate(transform.rotation)
      		let increment = forwardVector.scale(dt * this.speed );
      		transform.translate(increment)


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
	    			this.owner, 
	    			1,
	    			1
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
		if ( this.visible == 1 ) {
			this.move_self(dt);
		} else {
			this.tick += 1;
			if ( this.tick > 100 ) {
				this.parent.removeProjectile( this );
			}
		}
	}


	//----
	hide() {
		this.visible = 0;
		this.tick = 0;
		this.getComponent(Transform).position.y = -999;

	}
}





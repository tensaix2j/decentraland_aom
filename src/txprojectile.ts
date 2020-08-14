


import resources from "src/resources";


export class Txprojectile extends Entity {

	
	public id;
	public parent;


	public src_transform;
	public dst_transform;

	public visible_ypos;
	public visible = 1;
	public speed = 0.3;

	public owner;
	public type;

	constructor( id, parent , srcx, srcy, srcz, dstx, dsty, dstz , model , owner ,type ) {

		super();
		engine.addEntity(this);
		this.setParent( parent );

		this.id = id;
		this.parent = parent;
		this.owner = owner;
		this.type = type;

		this.dst_transform = new Transform({
			position: new Vector3( dstx, dsty, dstz )
		});

		let transform = new Transform({
			position: new Vector3( srcx, srcy, srcz )
		});

		this.addComponent( transform );
		this.addComponent( model );
		
		this.visible_ypos = this.getComponent(Transform).position.y;
		this.reinit();
	}


	//--------------
	reinit() {

		this.visible_ypos = this.getComponent(Transform).position.y;
		//log( "Projectile" , this.id , "reinited" , this.getComponent(Transform).position.y , this.speed ) ;
	}


	//--------------
	move_self( dt ) {
		
		let transform = this.getComponent(Transform);

		let diff_x = this.dst_transform.position.x -  transform.position.x;
		let diff_z = this.dst_transform.position.z -  transform.position.z;

    	var hypsqr = diff_x * diff_x + diff_z * diff_z  ;

    	if ( hypsqr > this.speed * this.speed   ) {
    		
    			var rad	 = Math.atan2( diff_x, diff_z );
	    		var deg  = rad * 180.0 / Math.PI ;

	    		var delta_x = this.speed * Math.sin(rad);
	    		var delta_z = this.speed * Math.cos(rad);

	    		transform.position.x += delta_x;
	    		transform.position.z += delta_z;
	    		

	    		// extra
	    		let diff_y = this.dst_transform.position.y -  transform.position.y;
    			var rad2 = Math.atan2( diff_y, diff_z );
	    		var delta_y = this.speed * Math.sin(rad2);
	    		var deg2    = rad2 * 180.0 / Math.PI;
	    		transform.position.y += delta_y;
	    		
	    		transform.lookAt( this.dst_transform.position );

	    } else {

	    	if ( this.owner != null && this.owner.attacktarget != null && this.owner.attacktarget.dead == 0 ) {
	    		this.owner.inflict_damage();
	    	}
	    	this.owner = null;
	    	this.hide();
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
		this.getComponent(Transform).position.y = this.visible_ypos;
		//this.getComponent(GLTFShape).visible = true;
	}
}





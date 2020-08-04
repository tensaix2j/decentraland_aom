



import {b2Vec2} from "src/Box2D/Common/b2Math"
import resources from "src/resources";


export class Txunit extends Entity {

	
	public id;
	public parent;
	public transform;
	public box2dbody;
	public visible_ypos;
	public visible = 1;
	public type ;
	public clips = {};
	public walking_queue = [];
	public speed = 10;

	constructor( id, parent , transform_args, box2d_transform_args,  shape , type ) {

		super();
		engine.addEntity(this);
		this.setParent( parent );


		this.id = id;
		this.parent = parent;
		
		this.transform = new Transform( transform_args );


		this.visible_ypos = this.transform.position.y;
		this.type = type;

		if ( type == "box" ) {
			this.box2dbody = this.parent.createStaticBox(  
	    				this.transform.position.x ,  
	    				this.transform.position.z ,  
	    				box2d_transform_args.scale.x , 
	    				box2d_transform_args.scale.z, 
	    				this.parent.world 
	    	);

		} else {
			this.box2dbody = this.parent.createDynamicCircle(  
	    				this.transform.position.x ,  
	    				this.transform.position.z ,  
	    				box2d_transform_args.scale.x , 
	    				this.parent.world, 
	    				true 
	    	);

	    } 

		this.addComponent( this.transform );
		this.addComponent( shape );
		this.updatePosition_toBox2d();


		let animator = new Animator();
		this.addComponent( animator );
	

		this.clips["shoot"] 	= new AnimationState("AttackArrow");
		this.clips["attack"] 	= new AnimationState("Punch");
		this.clips["die"] 		= new AnimationState("Die");
		
		if ( this.id == "devil" || this.id == "devilminion") {	
			this.clips["walk"] 		= new AnimationState("Flapping");
		} else {
			this.clips["walk"] 		= new AnimationState("Walking");
		}

		animator.addClip( this.clips["shoot"] ); 		
		animator.addClip( this.clips["walk"] );
		animator.addClip( this.clips["attack"] );
		animator.addClip( this.clips["die"] );
		
		this.playclip("walk");
		



	}

	//------------------
	update( dt ) {

		if ( this.walking_queue.length > 0 ) {

			var target = this.walking_queue[0];
			

			let diff_x = target.position.x -  this.box2dbody.GetPosition().x;
	    	let diff_z = target.position.z -  this.box2dbody.GetPosition().y;
	    	
	    	var hyp = Math.sqrt( diff_x * diff_x + diff_z * diff_z );

	    	if ( hyp > this.speed * dt  ) {
	    		
	    		this.playclip("walk");

	    		var rad	 = Math.atan2( diff_x, diff_z );
	    		var deg  = rad * 180.0 / Math.PI ;
	    		var delta_x = this.speed * dt * Math.sin(rad);
	    		var delta_z = this.speed * dt * Math.cos(rad);

	    		this.box2dbody.SetLinearVelocity( new b2Vec2( delta_x ,delta_z ) );

	    		this.transform.rotation.eulerAngles = new Vector3( 0, deg ,0) ;
	    	
	    	} else {
	    		this.walking_queue.shift();
	    	}
	    	

	    } else {
			//this.playclip("idle");
	    }
	}


	//------
	updatePosition_toBox2d()  {

		this.transform.position.x = this.box2dbody.GetPosition().x;
    	this.transform.position.z = this.box2dbody.GetPosition().y;
    	
    }


	//----
	playclip( doclip ) {

		//log("playclip", this.id, doclip );
		let clip;
		for ( clip in this.clips ) {
			this.clips[clip].stop();
		}
		this.clips[doclip].play();
	}	


     //---
    hide() {
    	this.transform.position.y = -999;
    	this.visible = 0;
    	this.box2dbody.SetLinearVelocity( new b2Vec2(0,0) );
    	this.box2dbody.SetAngularVelocity( 0.0 );
    	
    }
    //----
    show( ) {
    	this.transform.position.y = this.visible_ypos;
    	this.visible = 1;

    }
}
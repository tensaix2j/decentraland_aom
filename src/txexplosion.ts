



import {b2Vec2} from "src/Box2D/Common/b2Math"
import {b2BodyType} from "src/Box2D/Dynamics/b2Body"
import {b2AABB}  from "src/Box2D/Collision/b2Collision"
import {b2QueryCallback} from "src/Box2D/Dynamics/b2WorldCallbacks";



import resources from "src/resources";


export class Txexplosion extends Entity {

	
	public id;
	public parent;

	public transform;
	public visible_ypos;
	public visible = 1;

	public frame_index = 0;
	public tick = 0;
	public tick_per_frame = 1;
	public damage;
	public owner;

	public units_in_proximity = [];
	public box2daabb: b2AABB;
	public box2dcallback: b2QueryCallback;



	constructor( id, parent , transform_args  , shared_material , damage , owner ) {

		super();
		engine.addEntity(this);
		this.setParent( parent );

		this.id = id;
		this.parent = parent;
		this.damage = damage;
		this.owner  = owner;

		this.transform =  new Transform( transform_args );
		this.addComponent( this.transform );
		this.addComponent( new PlaneShape() );
		this.addComponent( shared_material );

		this.getComponent( PlaneShape ).uvs = this.getUV_coord();

		this.visible_ypos = this.getComponent(Transform).position.y;
		this.addComponent( new Billboard() );

		this.tick = this.tick_per_frame;
		this.frame_index = 0;

		let _this = this;
		this.box2daabb 		= new b2AABB();
		this.box2dcallback 	= new b2QueryCallback(); 
		this.box2dcallback.ReportFixture = function( evt ) { 

			if ( evt.m_body.m_userData != null ) {
				_this.units_in_proximity.push( evt.m_body.m_userData );
			}
			return true;
		};
			

	}


	public frame_index_to_frame_x = [ 0 , 1, 2, 3,    0, 1, 2, 3,   0, 1, 2, 3 , 0 , 1, 2, 3 ];
	public frame_index_to_frame_y = [ 3 , 3, 3, 3,    2, 2, 2, 2,   1, 1, 1, 1 , 0 , 0 , 0 , 0];


	//-------
	getUV_coord() {

		let frame_x = this.frame_index_to_frame_x[ this.frame_index ];
		let frame_y = this.frame_index_to_frame_y[ this.frame_index ];

		let arr = [
			frame_x	/4				,	frame_y /4,
			(frame_x + 1 )/4		,	frame_y /4,
			(frame_x + 1 )/4		,	(frame_y + 1 )/4,
			frame_x	/4				,	(frame_y + 1 )/4 ,
			frame_x	/4				,	frame_y /4,
			(frame_x + 1 )/4		,	frame_y /4,
			(frame_x + 1 )/4		,	(frame_y + 1 )/4,
			frame_x	/4				,	(frame_y + 1 )/4 
		]

		return arr;
	}


	//------
	find_nearby_units( ) {
		
		
		let _this = this;
		this.box2daabb.lowerBound = new b2Vec2( this.transform.position.x - this.transform.scale.x / 2  , this.transform.position.z - this.transform.scale.z / 2  );
		this.box2daabb.upperBound = new b2Vec2( this.transform.position.x + this.transform.scale.x / 2  , this.transform.position.z + this.transform.scale.z / 2  );
		this.units_in_proximity.length = 0;
		this.parent.world.QueryAABB( this.box2dcallback , this.box2daabb);
		
	}




	//----------
	update(dt) {

		if ( this.visible == 1 ) {
			
			if ( this.tick > 0 ) {
				this.tick -= 1;
			} else {
				
				if ( this.frame_index + 1 >= 16 ) {
					
					this.hide();

				} else {

					if ( this.frame_index == 3 ) {

						this.find_nearby_units();
						// No attack target ? look for one within aggro range. 
						let i;
						for ( i = 0 ; i < this.units_in_proximity.length ; i++ ) {

							let u = this.units_in_proximity[i];
							if ( u != null && u.dead == 0 && u.owner != this.owner ) {
								this.inflict_damage( u );
							}
						}

					} 
				
					this.frame_index = ( this.frame_index + 1 ) % 16;
					this.getComponent( PlaneShape ).uvs = this.getUV_coord();
					this.tick = this.tick_per_frame;
				}	
			}

		} else {
		
			this.tick += 1;
			if ( this.tick > 100 ) {
				this.parent.removeExplosion( this );
			}
		}
		
	}


	//---
	inflict_damage( attacktarget ) {

		if ( attacktarget != null ) {
			
			attacktarget.curhp -= this.damage;
			if ( attacktarget.curhp < 0 ) {
				attacktarget.curhp = 0;
			}
			//log( this.type, this.id , "hits " , this.attacktarget.type, this.attacktarget.id , " remaining hp = " , this.attacktarget.curhp , this.attacktarget.maxhp )

			let hp_perc = attacktarget.curhp / attacktarget.maxhp ;
			attacktarget.healthbar.getComponent( Transform ).scale.x = hp_perc * 1.5;
			if ( attacktarget.curhp <= 0 ) {
				
				//log( this.type, this.id , " kills " , this.attacktarget.type, this.attacktarget.id );
				attacktarget.die();
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








import resources from "src/resources";


export class Txscoreboard extends Entity {

	
	public id;
	public parent;
	public transform;
	public visible = 1;

	

	constructor( id, parent , transform_args ) {

		super();
		engine.addEntity(this);
		this.setParent( parent );

		this.id = id;
		this.parent = parent;
		
		this.transform =  new Transform( transform_args );
		this.addComponent( resources.models.scoreboard );
		this.addComponent( this.transform );
		this.addComponent( new Billboard() );
		
	}

}


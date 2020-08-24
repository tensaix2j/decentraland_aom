









export class TxAIBot  {

	public stage;
	public tick;
	public make_action_tick = 60;
	public current_mana = 100;
	public txcard_selected = null;
	public playerindex = -1;
	public waiting_mana_for_card = -1;

	//------------
	constructor( stage ) {
		this.stage = stage;
		this.tick = 0;
	}


	//------------
	update() {
		
		if ( this.current_mana < 100 ) {
            this.current_mana += 0.2 ;
        }	

		if ( this.tick < this.make_action_tick ) {
			this.tick += 1;
		} else {

			let rand_card_selection;
			
			if ( this.waiting_mana_for_card == -1 ) {
				rand_card_selection = ( Math.random() * this.stage.player_cards_collection.length ) >> 0 ; 
				this.waiting_mana_for_card = rand_card_selection;
			} else {
				rand_card_selection = this.waiting_mana_for_card;
			}	

			this.txcard_selected = this.stage.player_cards_collection[ rand_card_selection ];

			if ( this.current_mana >= this.txcard_selected.manaCost ) {
				
				this.current_mana -= this.txcard_selected.manaCost;

				let place_x = ( (( Math.random() *  2 >> 0 ) * 2  )- 1 ) * 3;
				let place_z = ( Math.random() *  3 + 0.2 ) * ( this.playerindex * -1 );

				if ( this.txcard_selected.isSpell == 1 ) {
					let used = 0;
					let i;
					for ( i = 6 ; i < this.stage.units.length ; i++ ) {
						let u = this.stage.units[i];
						if ( u != null && u.dead == 0 && u.owner != this.playerindex ) {
							place_x = u.transform.position.x;
							place_z = u.transform.position.z;
							used = 1;
							break;
						}
					}
					if ( used == 0 ) {
						for ( i = 3 ; i < 6 ; i++ ) {
							let u = this.stage.units[i];
							if ( u != null && u.dead == 0 && u.owner != this.playerindex ) {
								place_x = u.transform.position.x;
								place_z = u.transform.position.z;
								used = 1;
								break;
							}
						}
					}

				} else if ( this.txcard_selected.type == "tombstone" ||  this.txcard_selected.type == "goblinhut" ) {
					place_x = 0;
					place_z = 2 * ( this.playerindex * -1 );
				}

				this.stage.queue_command( [ "spawnUnit", this.txcard_selected.type , place_x , place_z , this.playerindex ] );
				this.waiting_mana_for_card = -1;

			} 
			this.tick = 0;
		}


	}

}


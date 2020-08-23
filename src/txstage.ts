


import {b2Vec2} from "src/Box2D/Common/b2Math"
import {b2World} from "src/Box2D/Dynamics/b2World"
import {b2QueryCallback} from "src/Box2D/Dynamics/b2WorldCallbacks";


import {b2BodyDef}  from "src/Box2D/Dynamics/b2Body"
import {b2FixtureDef}  from "src/Box2D/Dynamics/b2Fixture"
import {b2PolygonShape}  from "src/Box2D/Collision/Shapes/b2PolygonShape"
import {b2CircleShape}  from "src/Box2D/Collision/Shapes/b2CircleShape"
import {b2BodyType} from "src/Box2D/Dynamics/b2Body"
import {b2RevoluteJointDef} from "src/Box2D/Dynamics/Joints/b2RevoluteJoint"
import {b2DistanceJointDef} from "src/Box2D/Dynamics/Joints/b2DistanceJoint"
import {b2ContactListener} from "src/Box2D/Dynamics/b2WorldCallbacks"
import {b2AABB}  from "src/Box2D/Collision/b2Collision"


import resources from "src/resources";
import { Txunit } from "src/txunit";
import { Txcard } from "src/txcard";
import { Txprojectile } from "src/txprojectile";
import { Txexplosion } from "src/txexplosion" ;
import { Txclock } from "src/txclock";
import { Txscoreboard } from "src/txscoreboard";
import { Txclickable_box} from "src/txclickable_box";
import { Txsound } from "src/txsound";



export class Txstage extends Entity {

	public id;
	public userID;
	public transform;
	public camera;
	public world;
	public units = [];
	public battleground;
	public playerindex = 1;

	public card_sel_highlight;
	public card_sel_index = 0;

    public projectiles = [];
    public explosions = [];
    public clocks = [];

    
    public shared_fireball_shape;
    public shared_fireball_material;

    public shared_explosion_material;
    public shared_clock_material;
    public shared_zap_material;



    public uitxt_score_r ;
    public uitxt_score_b ;
    public uitxt_instruction;
    public uitxt_time ;

    public score_r = 0;
    public score_b = 0;
    public time_remaining = 180;
    public tick = 0;
    public sudden_death = 0;

    public buttons = {};
    public current_mana = 100;
    public uiimage_manabar ;

    public game_state = 0;
    public menu_page  = 0;
    public menu_labels = {};


    public card_sel_parent ;
    public player_cards_collection = [];
    public player_cards_in_use    = [];
    public txcard_selected:Txcard = null ;

    public animate_button_tick = 0;
    public animate_button_callback_id = "";

    public sounds = {};

    public debugsetting = 0;
    public cards_dealt_in_game = 4;

    public scoreboard;



	constructor( id, userID , transform_args , camera ) {

		super();
		engine.addEntity(this);

		this.id = id;
		this.userID = userID;
		this.transform = new Transform( transform_args );
		this.camera = camera;

		this.addComponent(  this.transform );
	   
	   
        let battleground = new Entity();
        battleground.setParent(this );

        let battleground_transform = new Transform({
            position: new Vector3( 0, 1.4 ,0 ),
            scale   : new Vector3( 1, 1, 1 )
        });

        
        

        let battleground_shape = resources.models.battleground;

        battleground.addComponent( battleground_shape );
        battleground.addComponent( battleground_transform );
        this.battleground = battleground;
        

        let gravity   = new b2Vec2(0, 0);
        this.world     = new b2World( gravity );

        
        let _this = this;



        this.construct_box2d_shapes();
       
    	
    	


        
		

    	battleground.addComponent( 
			new OnPointerDown((e) => {
				_this.global_input_down( e );	
			})
		);
		battleground.addComponent( 
			new OnPointerUp((e) => {
				_this.global_input_up( e );	
			})
		);


       


        this.init_castles();
        this.init_ui_2d();
        this.init_ui_3d();
        this.init_shared_material();
        this.init_sound();
        this.init_player_cards_collection();


        this.update_button_ui();

        this.debug();

    }   




















    //-------------
    debug( ) {

        if ( this.debugsetting == 1 ) {

            //this.card_input_down( null, this.player_cards_collection[3] );

            //this.createExplosion( new Vector3(0,2,0) , 1 , 1 );



            // this.createClock( new Vector3(0,2,0 ) );
            




            this.game_state = 1;

            this.sounds["warhorn"].playOnce();


            let i;
            /*

            for ( i = 0 ; i < 20 ; i++ ) {
                let u = this.createUnit( "goblin", i * 0.01,  i*0.01 , -1 );
                u.speed = 0;
            }
            */


            for ( i = 0 ; i < this.player_cards_collection.length ; i++ ) {
                this.player_cards_in_use.push(  this.player_cards_collection[i] );
            }


            this.time_remaining = 1000000;
            
            this.cards_dealt_in_game = 16;

            this.rearrange_cards_selected();
            this.update_button_ui();


            //this.units[0].curhp = 1;
            

        }
           

    }   







    //-------------------------
    //
    //
    //          Updates
    //
    //
    //-----------------------------



    //----------------
	step(dt:number) {
    	
    	this.world.Step( 0.05  , 10, 10 );
    	
    }


    //--
    update(dt) {
    	
        
        this.step(dt);
        let u;
        for ( u = 0 ; u < this.units.length ; u++) {
            let unit = this.units[u];
            if ( unit != null  ) {
                unit.update(dt);
            } 
        }

        let p;
        for ( p = 0 ; p < this.projectiles.length ; p++ ) {
            let projectile = this.projectiles[p];
            if ( projectile != null  ) {
                projectile.update(dt);
            }
        }

        let exp;
        for ( exp = 0 ; exp < this.explosions.length ; exp++ ) {
            let explosion = this.explosions[exp];
            if ( explosion != null  ) {
                explosion.update(dt);
            }
        }
         

        let cl;
        for ( cl = 0 ; cl < this.clocks.length ; cl++ ) {
            let clock = this.clocks[cl];
            if ( clock != null  ) {
                clock.update(dt);
            }
        }

        if ( this.game_state == 1 ) {
            this.update_mana();
            this.update_score();
            this.update_time();
        } else {
            this.update_animate_button();
        }
    }



    //-----------
    update_mana() {

        if ( this.current_mana < 100 ) {
            this.current_mana += 0.1 ;
        }
        
        let calc_height = ( this.current_mana  * 478 / 100 ) >> 0;
        this.uiimage_manabar.height = calc_height;
        this.uiimage_manabar.positionY =   -( 256 - calc_height / 2 );
    }


    //-----------
    update_score() {
        this.uitxt_score_r.value = this.score_r ;
        this.uitxt_score_b.value = this.score_b ;
        this.scoreboard.refresh_score( this.score_r , this.score_b );


    }

    update_time() {

        if ( this.game_state == 1 ) {
            this.tick += 1 ;
            
            if ( this.tick > 30 ) {
                this.tick = 0 ;


                if ( this.time_remaining > 0 ) {
                    this.time_remaining -= 1;
                } else {

                    if ( this.sudden_death == 1 || this.score_b != this.score_r ) {
                        this.endgame();
                    } else {
                        this.sudden_death = 1 ;
                        this.time_remaining = 60;
                    }
                    
                }
            }

            if ( this.game_state == 1 ) {
                
                let minutes_rem = (this.time_remaining / 60 ) >> 0;
                let seconds_rem = this.time_remaining % 60;

                let zeropad = ""
                if ( (seconds_rem).toString().length == 1 ) {
                    zeropad = "0";
                }

                let extra_note = "";
                if ( this.sudden_death == 1 ) {
                    extra_note = "Extra Time:\n";
                }
                this.uitxt_time.value = extra_note + "" + minutes_rem + ":" + zeropad +  seconds_rem 
            
            }
            if ( this.sudden_death == 1 ) {
                this.uitxt_time.color = Color3.Red();
            } else {
                this.uitxt_time.color = Color3.White();
            }
        }
    }



    //------------------------------------
    update_button_ui( ) {

        let b;
        for ( b in this.buttons ) {
            this.buttons[b].hide();
        }
        for ( b in this.menu_labels ) {
            this.menu_labels[b].getComponent( TextShape ).value = "";
        }
        this.card_sel_parent.getComponent(Transform).position.y  = -999;
            
        
        if ( this.game_state == 0 ) { 

            if  ( this.menu_page == 0 ) {
            
                this.buttons["singleplayer"].show();
                this.buttons["multiplayer"].show();
            
            } else if ( this.menu_page == 1  ) {

                this.card_sel_parent.getComponent(Transform).position.y = 2;
                this.menu_labels["lbl1"].getComponent(TextShape).value = "Please Select 8 cards to use in battle"
                this.buttons["confirm"].show();
                this.buttons["cancel"].show();
                
            }   

        } else if ( this.game_state == 1 ) {

            this.card_sel_parent.getComponent(Transform).position.y = 2;



        } else if ( this.game_state == 2 ) {


            this.buttons["leavegame"].show();
        }
    }




    //--------------
    reset_game() {
        
        this.time_remaining = 180;
        this.sudden_death = 0;
        this.score_r = 0;
        this.score_b = 0;

        // Clear everything.
        let u;
        for ( u = this.units.length ; u >= 0 ;  u--) {
            let unit = this.units[u];
            if ( unit != null ) {
                this.removeUnit( unit ); 
            }
        }

        let p;
        for ( p = this.projectiles.length ; p >= 0 ; p-- ) {
            let projectile = this.projectiles[p];
            if ( projectile != null  ) {
                this.removeProjectile( projectile );
            }
        }

        let exp;
        for ( exp = this.explosions.length ; exp >= 0 ; exp-- ) {
            let explosion = this.explosions[exp];
            if ( explosion != null  ) {
               this.removeExplosion( explosion );
            }
        }
        
        let cl;
        for ( cl = this.clocks.length ; cl >= 0 ; cl-- ) {
            let clock = this.clocks[cl];
            if ( clock != null  ) {
                this.removeClock( clock );
            }
        }

        
        this.init_castles();    
        this.update_score();

    }



    //---------------------------
    //
    //         INPUTS
    //
    //---------------------------



    global_input_down(e) {

        if ( e.buttonId == 0 ) {

            if ( this.game_state == 1 ) {
            	if ( e.hit ) {

    				let hitEntity = engine.entities[e.hit.entityId];
    				
    				if (  hitEntity == this.battleground ) {
    					
    					let place_x = e.hit.hitPoint.x - this.transform.position.x;
    					let place_z = e.hit.hitPoint.z - this.transform.position.z;
    					
    					if ( this.txcard_selected != null ) {
    						
                            if ( this.current_mana >= this.txcard_selected.manaCost || this.debugsetting == 1 ) {
        
                                if ( this.placement_is_allowed( this.txcard_selected , place_x , place_z ) == 1  ) {


                                    this.current_mana -= this.txcard_selected.manaCost;
                                    this.spawnUnit( this.txcard_selected.type , place_x , place_z , this.playerindex );

                                    if ( this.debugsetting == 0 ) {
                                        this.rotate_card_in_use();
                                    }

                                     this.uitxt_instruction.value = "";

                                } else {
                                    this.uitxt_instruction.value = "Not allowed to place there."
                                }
                            } else {
                                this.uitxt_instruction.value = "Not enough mana";
                            }
    								
    					} else {
                            this.uitxt_instruction.value = "No card selected.";
                        }

    				}
    			}
            }

        } else if ( e.buttonId == 1  ) {
        	

            // E button
        	if ( this.debugsetting == 1 ) {
                this.playerindex = 1;
            }

        } else if ( e.buttonId == 2 ) {
        	// F button 	
        	
            if ( this.debugsetting == 1 ) {
                this.playerindex = -1;
            }
        }	
     }



     //----------------------
    global_input_up(e) {

        if ( e.buttonId == 0 ) {
      	
        } else if ( e.buttonId == 1 ) {
            

        } else if ( e.buttonId == 2 ) {


        }
     }



    //------------------
    txclickable_button_onclick( id , userData ) {
        
        
        this.animate_button_tick = 20;
        this.animate_button_callback_id = id;

        this.sounds["buttonclick"].playOnce();


   }


   //-------------------------
   update_animate_button() {
        
        if ( this.animate_button_callback_id != "" ) {
   
            if ( this.animate_button_tick > 0 ) {

                this.animate_button_tick -= 1;
                
                if ( this.animate_button_callback_id == "singleplayer" ) {
                           
                    this.buttons["singleplayer"].getComponent(Transform).position.y -= 0.35;
                    this.buttons["multiplayer"].getComponent(Transform).position.y -= 0.35;
        
                } else if ( this.animate_button_callback_id == "cancel" || this.animate_button_callback_id == "confirm" ) {

                    this.buttons["confirm"].getComponent(Transform).position.y -= 0.35;
                    this.buttons["cancel"].getComponent(Transform).position.y -= 0.35;
                    this.card_sel_parent.getComponent( Transform ).position.y -= 0.35;

                } else if ( this.animate_button_callback_id == "leavegame" ) {

                     this.buttons["leavegame"].getComponent(Transform).position.y -= 0.35;
                }

            } else {

                if ( this.animate_button_callback_id == "singleplayer" ) {
                    this.buttons["singleplayer"].getComponent(Transform).position.y = 5;
                    this.buttons["multiplayer"].getComponent(Transform).position.y  = 4;
                
                } else if ( this.animate_button_callback_id == "cancel" || this.animate_button_callback_id == "confirm" ) {

                    this.buttons["confirm"].getComponent(Transform).position.y = 7;
                    this.buttons["cancel"].getComponent(Transform).position.y  = 7;
                    this.card_sel_parent.getComponent( Transform ).position.y  = 2;

                } else if ( this.animate_button_callback_id == "leavegame" ) {

                    this.buttons["leavegame"].getComponent(Transform).position.y = 5;
                }


                this.txclickable_button_onclick_animate_done_continue( this.animate_button_callback_id );
                this.animate_button_callback_id  = "";
            }
        }
   }



   //--------------
   txclickable_button_onclick_animate_done_continue( id ) {

        if ( id == "singleplayer" ) {

            this.menu_page = 1;
            this.rearrange_cards_collection();
            this.update_button_ui();

        } else if ( id == "cancel" ) {

            this.menu_page = 0;
            this.update_button_ui();

        } else if ( id == "confirm" ) {

            if ( this.game_state == 0 && this.menu_page == 1 ) {
                if ( this.count_card_selected() == 8 ) {

                    this.fill_player_cards_selected();
                    this.rearrange_cards_selected(); 
                    this.game_state = 1;
                    this.sounds["warhorn"].playOnce();
                    this.update_button_ui();
                    this.menu_labels["lbl1"].getComponent( TextShape ).value = "Battle Begins!";
                } else {
                     this.menu_labels["lbl1"].getComponent( TextShape ).value = "Please select exactly 8 cards";
                }
            }
        } else if ( id == "leavegame" ) {

            this.game_state = 0;
            this.menu_page = 0;
            this.uitxt_instruction.value = "";

            this.reset_game();
            this.update_button_ui();
        }
   }



    //---------------------------
    card_input_down( e, txcard ) {

        this.sounds["buttonclick"].playOnce();
        
        if ( this.game_state == 0 ) {

            if ( this.count_card_selected() >= 8 && txcard.isSelected == 0 ) {
                this.menu_labels["lbl1"].getComponent( TextShape ).value = "Maximum 8 cards. Click on the selected card to unselect " ;
            } else {
                txcard.toggle();
            }


            this.menu_labels["lbl2"].getComponent( TextShape ).value = "Cards Selected: " + this.count_card_selected() ;
        

        } else if ( this.game_state == 1 ) {
    	      
            let i;
            for ( i = 0 ; i < 8 ; i++ ) {
                this.player_cards_in_use[i].turnoff();
            }
            txcard.turnon(); 
            this.txcard_selected = txcard ;
            this.uitxt_instruction.value = "";
            
        }   

    }



    //---------------------------
    card_input_up( e, type ) {
    
    }

































    //---------
    get_txcard_selected_index() {
        let i;
        for ( i = 0 ; i < 4 ; i++ ) {
            if ( this.player_cards_in_use[i] == this.txcard_selected ) {
                return i;
            }
        }
        return -1;   
    }



    //----------------
    rotate_card_in_use() {

        let i;

        if ( this.txcard_selected != null ) {
            
            let card_selected_index = this.get_txcard_selected_index();
            this.player_cards_in_use[card_selected_index] = this.player_cards_in_use[this.cards_dealt_in_game];
            this.player_cards_in_use[this.cards_dealt_in_game] = this.player_cards_in_use[this.cards_dealt_in_game+1];
            this.player_cards_in_use[this.cards_dealt_in_game+1] = this.player_cards_in_use[this.cards_dealt_in_game+2];
            this.player_cards_in_use[this.cards_dealt_in_game+2] = this.player_cards_in_use[this.cards_dealt_in_game+3];
            this.player_cards_in_use[this.cards_dealt_in_game+3] = this.txcard_selected;
            this.txcard_selected.turnoff();
        }
        this.txcard_selected = null;
        this.rearrange_cards_selected(); 
        
    }




    //--------------------
    fill_player_cards_selected() {

        let i;
        this.player_cards_in_use.length = 0;
        for ( i = 0 ; i < this.player_cards_collection.length ; i++ ) {
            if ( this.player_cards_collection[i].isSelected ) {
                let txcard = this.player_cards_collection[i];
                this.player_cards_in_use.push( txcard );
            }
        }
    }


    //------------------
    rearrange_cards_collection() {

        let i;

        for ( i = 0 ; i < this.player_cards_collection.length ; i++ ) {
            
            let txcard = this.player_cards_collection[i];
            let x = ( i % 4 ) * 1.2;
            let y = ((i / 4)  >> 0 ) * 1.2;
            
            txcard.reposition( x,y );
            txcard.show();
            txcard.turnoff();
        }

    }

    //------------------
    rearrange_cards_selected() {

        let i;

        for ( i = 0 ; i < this.player_cards_collection.length ; i++ ) {
            let txcard = this.player_cards_collection[i];
            txcard.hide();
        }
        

        for ( i = 0 ; i < this.cards_dealt_in_game ; i++ ) {
            
            let x = ( i % 4 ) * 1.2;
            let y = ((i / 4)  >> 0 ) * 1.2;
            
            let txcard = this.player_cards_in_use[i];
            txcard.reposition( x,y );
            txcard.show();
            txcard.turnoff();
            
        }
    }

    //-----
    count_card_selected() {

        let i;
        let count = 0;
        for ( i = 0 ; i < this.player_cards_collection.length ; i++ ) {
            if ( this.player_cards_collection[i].isSelected ) {
                count += 1;
            }
        }
        return count;
    }




    //-----------------------------------------------------
    placement_is_allowed( txcard , place_x , place_z ) {

       

        if ( txcard.isSpell == 1  ) {
            return 1;
        } else {
            if ( this.playerindex == 1 && place_z <= 0 ) {
                return 1;
            } else if ( this.playerindex == -1 && place_z >= 0 ) {
                return 1;
            } else if ( this.playerindex == 1 && place_z <= 4 ) {
                if ( place_x < 0 && ( this.units[0] == null || this.units[0] && this.units[0].dead > 0 )  ) {
                    return 1;
                } else if ( place_x > 0 && ( this.units[1] == null || this.units[1] && this.units[1].dead > 0 )  ) {
                    return 1;
                }
            } else if ( this.playerindex == -1 && place_z >= -4 ) {
                if ( place_x < 0 && ( this.units[3] == null || this.units[3] && this.units[3].dead > 0 )  ) {
                    return 1;
                } else if ( place_x > 0 && ( this.units[4] == null || this.units[4] && this.units[4].dead > 0 )  ) {
                    return 1;
                }
            }
        }
        return 0;
    }



    endgame( ) {
    
        this.sounds["endgame"].playOnce();

        this.game_state = 2;
        let final_txt = "Game Over.\n";
        if ( this.score_r > this.score_b ) {
            final_txt += "Red Wins!";
        } else if ( this.score_r < this.score_b ) {
            final_txt += "Blue Wins!";
        } else {
            final_txt += "Draw Game";
        }
        final_txt += "\n\nClick Restart to play again";
        this.uitxt_instruction.value = final_txt;
        this.uitxt_time.value = "";

        this.update_score();
        this.update_button_ui();
    }






    //-----------
    unit_on_die( unit ) {
        
        if ( this.game_state == 1 ) {

            if ( unit.id == 2 ) {
                // Red wins
                this.score_r = 3;
                this.endgame();
                        
            } else if ( unit.id == 5 ) {
                // Blue wins
                this.score_b = 3;
                this.endgame();

                
            } else if ( unit.id == 0 ) {
                this.score_r += 1;
                if ( this.sudden_death == 1 ) {
                    this.endgame();
                }

            } else if ( unit.id == 1 ) {
                this.score_r += 1;
                if ( this.sudden_death == 1 ) {
                    this.endgame();
                }            
            } else if ( unit.id == 3 ) {
                this.score_b += 1;
                if ( this.sudden_death == 1 ) {
                    this.endgame();
                }    
            } else if ( unit.id == 4 ) {
                this.score_b += 1;
                if ( this.sudden_death == 1 ) {
                    this.endgame();
                }
            } 
        }
    }


































    //---------------
    //
    // Init section
    //
    //---------------











    //----
    init_ui_3d() {

        


        this.menu_labels["lbl1"] = new Entity();
        this.menu_labels["lbl1"].addComponent( new TextShape() );
        this.menu_labels["lbl1"].addComponent( new Transform(
            {
                position:new Vector3( -8,  6 , 4 ),
                scale   :new Vector3( 0.2, 0.2, 0.2 )
            }
        ));
        this.menu_labels["lbl1"].addComponent( new Billboard() );
        this.menu_labels["lbl1"].getComponent( TextShape ).color = Color3.Black();
        this.menu_labels["lbl1"].setParent( this );


        this.menu_labels["lbl2"] = new Entity();
        this.menu_labels["lbl2"].addComponent( new TextShape() );
        this.menu_labels["lbl2"].addComponent( new Transform(
            {
                position:new Vector3( -8,  5.5 , 4 ),
                scale   :new Vector3( 0.2, 0.2, 0.2 )
            }
        ));
        this.menu_labels["lbl2"].addComponent( new Billboard() );
        this.menu_labels["lbl2"].getComponent( TextShape ).color = Color3.Black();
        this.menu_labels["lbl2"].setParent( this );



        this.scoreboard = new Txscoreboard(
            0,
            this,
            {
                position: new Vector3(0,8,0)
            }
        )



        this.init_buttons();
    }   






    //-----------------
    init_buttons() {

        this.buttons["singleplayer"] = new Txclickable_box(
            "Single Player" , 
            "singleplayer",
            {
                position: new Vector3(-8, 5,  0),
                scale   : new Vector3(0.5,0.5,0.5)
            },
            this
        );


        
        this.buttons["multiplayer"] = new Txclickable_box(
            "Multi Player",
            "multiplayer", 
            {
                 position: new Vector3(-8, 4,  0),
                 scale   : new Vector3(0.5,0.5,0.5)
            },
            this
        );


        

        this.buttons["confirm"] = new Txclickable_box(
            "Confirm" , 
            "confirm",
            {
                position: new Vector3( -8 , 7,  -1),
                scale   : new Vector3(0.5,0.5,0.5)
            },
            this
        );
        this.buttons["confirm"].hide();


        this.buttons["cancel"] = new Txclickable_box(
            "Cancel" , 
            "cancel",
            {
                position: new Vector3( -8 , 7,  2),
                scale   : new Vector3(0.5,0.5,0.5)
            },
            this
        );
        this.buttons["cancel"].hide();




        this.buttons["leavegame"] = new Txclickable_box(
            "Leave Game" ,
            "leavegame", 
            {
                position: new Vector3(-8, 5, 0),
                scale   : new Vector3(0.5,0.5,0.5)
            },
            this
        );
        this.buttons["leavegame"].hide();
        
        
    }   


    //---
    init_castles() {

        let i;
        let tower_x  = [ -2.95  , 2.95,    0,  -2.95,    2.95,        0  ];
        let tower_z  = [  4.55  , 4.55,  6.7,  -4.55,   -4.55,     -6.7  ];
        let tower_r  = [   1.0,    1.0,  1.5,    1.0,     1.0,      1.5  ];
        let tower_o  = [    -1 ,    -1,   -1,      1,       1,        1  ];
        let tower_m  = [ resources.models.tower_b ,
                         resources.models.tower_b ,
                         resources.models.tower_b ,
                         resources.models.tower_r ,
                         resources.models.tower_r ,
                         resources.models.tower_r ] 

        let tower_aggrorange = 3.0;


        for ( i = 0 ; i < tower_x.length ; i++ ) {

            
            let x = tower_x[i];
            let z = tower_z[i];
            let r = tower_r[i];
            let model = tower_m[i];
            let owner = tower_o[i];
                   
            let tower = new Txunit( 
                    this.units.length, 
                    this, 
                    {
                        position: new Vector3( x,  2, z ),
                        scale   : new Vector3( r, 1,  r )
                    },
                    {
                        scale   : new Vector3( r,  r , r )
                    },
                    model,
                    "tower",
                    "static",
                    owner,
                    0,
                    tower_aggrorange,
                    1.5
            );

            
            tower.attackRange   = 12.0;
            
            if ( i == 2 || i == 5 ) {
                tower.maxhp         = 5304;
            } else {
                tower.maxhp         = 3346;
            }
            tower.damage            = 119;
            tower.projectile_user   = 1;
            tower.attackSpeed       = 24;
            tower.curhp             = tower.maxhp;
            


            this.units.push( tower );
        }
    }




    //--------------
    init_ui_2d() {


        let ui_2d_canvas = new UICanvas();
        //    ui_2d_canvas.height = 4000;

        let ui_2d_image = new UIImage(ui_2d_canvas, resources.textures.crown_r );
        ui_2d_image.vAlign = "bottom";

        ui_2d_image.width = 40;
        ui_2d_image.height = 40;
        ui_2d_image.sourceWidth = 128;
        ui_2d_image.sourceHeight = 128;
        ui_2d_image.positionX = -100;

        ui_2d_image = new UIImage(ui_2d_canvas, resources.textures.crown_b );
        ui_2d_image.vAlign = "bottom";

        ui_2d_image.width = 40;
        ui_2d_image.height = 40;
        ui_2d_image.sourceWidth = 128;
        ui_2d_image.sourceHeight = 128;
        ui_2d_image.positionX = 100;
        
        let ui_2d_text = new UIText( ui_2d_canvas );
        ui_2d_text.value = "0";
        ui_2d_text.vAlign = "bottom";
        ui_2d_text.fontSize = 18;
        ui_2d_text.positionX =  -56;
        ui_2d_text.positionY =  6;
        this.uitxt_score_r = ui_2d_text;



        ui_2d_text = new UIText( ui_2d_canvas );
        ui_2d_text.value = "0";
        ui_2d_text.vAlign = "bottom";
        ui_2d_text.fontSize = 18;
        ui_2d_text.positionX =  144;
        ui_2d_text.positionY = 6;
        this.uitxt_score_b = ui_2d_text;
                
        
        ui_2d_text = new UIText( ui_2d_canvas );
        ui_2d_text.value = "3:00";
        ui_2d_text.vAlign = "bottom";
        ui_2d_text.fontSize = 16;
        ui_2d_text.positionX = 30;
        ui_2d_text.positionY = 10;
        this.uitxt_time = ui_2d_text;
        

        ui_2d_text = new UIText( ui_2d_canvas );
        ui_2d_text.value = "" ;
        ui_2d_text.vAlign = "center";
        ui_2d_text.fontSize = 16;
        ui_2d_text.positionX = -50;
        ui_2d_text.positionY = 40;
        this.uitxt_instruction = ui_2d_text;


        ui_2d_image = new UIImage(ui_2d_canvas , resources.textures.manacontainer );
        ui_2d_image.vAlign = "center";
        ui_2d_image.hAlign = "right";
        ui_2d_image.width = 32;
        ui_2d_image.height = 532;
        ui_2d_image.sourceWidth = 64;
        ui_2d_image.sourceHeight = 1024;
        ui_2d_image.positionX = -16;


        ui_2d_image = new UIImage(ui_2d_canvas , resources.textures.manabar );
        ui_2d_image.vAlign = "center";
        ui_2d_image.hAlign = "right";
        ui_2d_image.width = 24;
        let calc_height = this.current_mana * 478 / 100  ;
        ui_2d_image.height = calc_height;
        ui_2d_image.positionY = -( 256 - calc_height / 2  );
        ui_2d_image.sourceWidth = 49;
        ui_2d_image.sourceHeight = 956;
        ui_2d_image.positionX = -20;

        this.uiimage_manabar = ui_2d_image;

         ui_2d_image = new UIImage(ui_2d_canvas , resources.textures.manalabel );
        ui_2d_image.vAlign = "center";
        ui_2d_image.hAlign = "right";
        ui_2d_image.width = 32;
        ui_2d_image.height = 512;
        ui_2d_image.sourceWidth = 64;
        ui_2d_image.sourceHeight = 1024;
        ui_2d_image.positionX = -16;
    }




    //---
    init_shared_material() {

        let material = new Material();
        material.albedoTexture = resources.textures.explosion;
        material.roughness = 1.0;
        material.specularIntensity = 0;
        material.transparencyMode  = 2;
        material.emissiveIntensity = 4.5;
        material.emissiveColor = Color3.FromInts(252, 164, 23);
        this.shared_explosion_material = material;



        material = new Material();
        material.albedoTexture = resources.textures.zap;
        material.roughness = 1.0;
        material.specularIntensity = 0;
        material.transparencyMode  = 2;
        material.emissiveIntensity = 10.5;
        material.emissiveColor = Color3.FromInts(155, 155, 255);
        this.shared_zap_material = material;



        material = new Material();
        material.albedoTexture = resources.textures.fireball;
        material.roughness = 1.0;
        material.specularIntensity = 0;
        material.transparencyMode  = 2;
        material.emissiveIntensity = 4.5;
        material.emissiveColor = Color3.FromInts(252, 164, 23);
        this.shared_fireball_material = material;
        this.shared_fireball_shape = new PlaneShape();
        this.shared_fireball_shape.uvs = [
            0, 0 ,
            1/4, 0 ,
            1/4, 1/4 ,
            0, 1/4 ,
            0, 0 ,
            1/4, 0 ,
            1/4, 1/4 ,
            0, 1/4 ,
        ];






        material = new Material();
        material.albedoTexture = resources.textures.clock;
        material.roughness = 1.0;
        material.specularIntensity = 0;
        material.transparencyMode  = 2;
        this.shared_clock_material = material; 


    }




    init_sound( ) {

        let snd ;
        for ( snd in resources.sounds ) {
            this.sounds[snd]     = new Txsound(this, resources.sounds[snd] );
        }    
    }









































    //-------------
    removeClock( cl ) {

        engine.removeEntity( this.clocks[ cl.id ] );
        this.clocks[ cl.id ] = null ;

        

        let i;
        for ( i =  this.clocks.length - 1 ; i >= 0 ; i-- ) {
            // Shorten array if possible
            if ( this.clocks[i] == null ) {
                this.clocks.length = i;
            } else {
                break;
            }
        }

        log( "clock removed ", cl.id  , this.clocks.length );

    }

    //------------
    getRecyclableClockIndex( ) {

        let i;
        for ( i = 0 ; i < this.clocks.length ; i++ ) {
            if ( this.clocks[i] == null ) {
                return i;
            }
        }
        return -1;
    }


    //------------
    getRecyclableClock( ) {

        return -1;
        let i;
        for ( i = 0 ; i < this.clocks.length ; i++ ) {
            if ( this.clocks[i] != null  && this.clocks[i].visible == 0 ) {
                return i;
            }
        }
        return -1;
    }

    //---------
    createClock( location_v3  ) {

        let clock:Txclock;
        let recyclable_index = this.getRecyclableClock( );


        if ( recyclable_index >= 0 ) {

            // Reuse entity
            clock = this.clocks[recyclable_index];
            clock.getComponent(Transform).position = location_v3;
            clock.tick = clock.tick_per_frame;
            clock.frame_index = 0;
            clock.getComponent( PlaneShape ).uvs = clock.getUV_coord();

            clock.visible = 1;
            
            log( "clock reuse entity" , clock.id , " arr len", this.clocks.length );

        } else {
        
            clock = new Txclock(
                this.clocks.length,
                this,
                {
                    position: location_v3
                },
                this.shared_clock_material
            ) ;
            
            recyclable_index = this.getRecyclableClockIndex();

            if ( recyclable_index == -1 ) {
                this.clocks.push( clock );

            } else {
                // Reuse index.
                clock.id = recyclable_index;
                this.clocks[recyclable_index] = clock;
            }

            log( "Clock " , clock.id , " inited. arr len", this.clocks.length );
        }

       
            
        return clock;
    }







    //------------------
    removeExplosion( ex ) {

        engine.removeEntity( this.explosions[ ex.id ] );
        this.explosions[ ex.id ] = null;

        let i;
        for ( i =  this.explosions.length - 1 ; i >= 0 ; i-- ) {
            // Shorten array if possible
            if ( this.explosions[i] == null ) {
                this.explosions.length = i;
            } else {
                break;
            }
        }
    }



    //------------
    getRecyclableExplosionIndex( ) {

        let i;
        for ( i = 0 ; i < this.explosions.length ; i++ ) {
            if ( this.explosions[i] == null ) {
                return i;
            }
        }
        return -1;
    }


    //------------
    getRecyclableExplosion( type ) {

        let i;
        for ( i = 0 ; i < this.explosions.length ; i++ ) {
            if ( this.explosions[i] != null && this.explosions[i].type == type && this.explosions[i].visible == 0 ) {
                return i;
            }
        }
        return -1;
    }



    //---------
    createExplosion( location_v3 ,  owner ,  scale_x , scale_y , explosion_type, damage , damage_building ) {

        let explosion:Txexplosion;
        let recyclable_index = this.getRecyclableExplosion( explosion_type );

        let material = this.shared_explosion_material;

        if ( explosion_type == 1 ) {
            material = this.shared_explosion_material;
            this.sounds["explosion"].playOnce();

        } else if ( explosion_type == 2 ) {
            material = this.shared_zap_material;
            this.sounds["electricshock"].playOnce();

        }


        
        if ( recyclable_index >= 0 ) {

            // Reuse entity
            explosion = this.explosions[recyclable_index];
            explosion.getComponent(Transform).position = location_v3;
            explosion.getComponent(Transform).scale.x    = scale_x ;
            explosion.getComponent(Transform).scale.x    = scale_y ;
                
            explosion.damage = damage;
            explosion.owner  = owner;
            explosion.tick = explosion.tick_per_frame;
            explosion.frame_index = 0;
            explosion.getComponent( PlaneShape ).uvs = explosion.getUV_coord();

            explosion.visible = 1;
            

        } else {
            
            // constructor( id, parent , transform_args  , shared_material , owner, type,  damage ,  damage_building ) 

            explosion = new Txexplosion(
                this.explosions.length,
                this,
                {
                    position: location_v3,
                    scale   : new Vector3( scale_x, scale_y , 1 )
                },
                material,
                owner,
                explosion_type,
                damage,
                damage_building
            ) ;
            
            recyclable_index = this.getRecyclableExplosionIndex();

            if ( recyclable_index == -1 ) {
                this.explosions.push( explosion );

            } else {
                // Reuse index.
                explosion.id = recyclable_index;
                this.explosions[recyclable_index] = explosion;
            }
        }

        
       // log( "Explosion " , explosion.id , " inited. arr len", this.explosions.length );
            
        return explosion;
    }

















    //------------------
    removeProjectile( p ) {

        engine.removeEntity( this.projectiles[ p.id ] );
        this.projectiles[ p.id ] = null;

        let i;
        for ( i =  this.projectiles.length - 1 ; i >= 0 ; i-- ) {
            // Shorten array if possible
            if ( this.projectiles[i] == null ) {
                this.projectiles.length = i;
            } else {
                break;
            }
        }
    }





     //------------
    getRecyclableProjectileIndex() {

        let i;
        for ( i = 0 ; i < this.projectiles.length ; i++ ) {
            if ( this.projectiles[i] == null ) {
                return i;
            }
        }
        return -1;
    
    }

    //--------
    getRecyclableProjectile( type ) {

        let i;
        for ( i = 0 ; i < this.projectiles.length ; i++ ) {
            if ( this.projectiles[i] != null  && this.projectiles[i].type == type && this.projectiles[i].visible == 0 ) {
                return i;
            }
        }
        return -1;
    
    }



    //------------
    createProjectile( src_v3, dst_v3 , owner , projectile_type , attacktarget, damage , damage_building ) {


        let projectile:Txprojectile;
        
        let shape ;
        if ( projectile_type == 1 ) {

            shape = resources.models.arrow;
            this.sounds["arrowshoot"].playOnce();


        } else if ( projectile_type == 2  ) {

            shape = this.shared_fireball_shape;
            this.sounds["whoosh"].playOnce();
            
        } else if ( projectile_type == 3 ) {

            shape = this.shared_fireball_shape;
            this.sounds["whoosh"].playOnce();

        }


        let recyclable_index = this.getRecyclableProjectile( projectile_type );
        
        if ( recyclable_index >= 0 ) {

            // Reuse entity
            projectile = this.projectiles[recyclable_index];
            projectile.getComponent(Transform).position = src_v3;
            projectile.src_v3                           = src_v3;
            projectile.dst_v3                           = dst_v3;
            projectile.attacktarget = attacktarget;
            projectile_type = projectile_type;
            projectile.damage = damage;
            projectile.damage_building = damage_building;
            projectile.owner  = owner;
            projectile.tick   = 0;
            projectile.visible = 1;
            

           // log("Reusing projectile" , "type", projectile.type, "id" , projectile.id , "arrlen", this.projectiles.length );

        } else {

            //  constructor( id, parent , shape, src_v3, dst_v3  , owner,  type, attacktarget ,  damage , damage_building ) {

            projectile = new Txprojectile(
                this.projectiles.length,
                this,
                shape,
                src_v3, 
                dst_v3,
                owner,
                projectile_type,
                attacktarget,
                damage,
                damage_building,
            );

            if ( projectile_type == 1 ) {

                projectile.speed = 4.5;

            } else if ( projectile_type == 2 ) {

                projectile.speed = 2.5;
                projectile.getComponent( Transform ).scale.setAll(0.5);
                projectile.addComponent( this.shared_fireball_material );
                projectile.addComponent( new Billboard() );
            
            } else if ( projectile_type == 3 ) {
                    
                projectile.speed = 10;
                projectile.getComponent( Transform ).scale.setAll(1.5);
                projectile.addComponent( this.shared_fireball_material );
                projectile.addComponent( new Billboard() );
            
            }



            recyclable_index = this.getRecyclableProjectileIndex();
            if ( recyclable_index == -1 ) {    
                this.projectiles.push( projectile );

             //   log("Initing new projectile" , "type", projectile.type, "id" , projectile.id , "arrlen", this.projectiles.length );

            
            } else {
                // Reuse index
                projectile.id = recyclable_index;
                this.projectiles[recyclable_index] = projectile 

            //    log("Initing new projectile reusing index" , "type", projectile.type, "id" , projectile.id , "arrlen", this.projectiles.length );

            
            }
        }

        //log( "Projectile " , "type:", projectile.type, "id:", projectile.id , " inited. arr len", this.projectiles.length );
        return projectile;
    }















    //------------
    getRecyclableUnitIndex( ) {
        let i;
        for ( i = 6 ; i < this.units.length ; i++ ) {
            if ( this.units[i] == null ) {
                return i;
            }
        }
        return -1;
    }


    //------------
    getRecyclableUnit( type ) {
        let i;
        for ( i = 6 ; i < this.units.length ; i++ ) {
            if ( this.units[i] != null && this.units[i].visible == 0 && this.units[i].type == type ) {
                return i;
            }
        }
        return -1;
    }






    //------------------
    removeUnit( u ) {

        log( "Removing unit", u.id );

        this.world.DestroyBody( u.box2dbody );
        engine.removeEntity( this.units[ u.id ] );
        this.units[ u.id ] = null;


        let i;
        for ( i =  this.units.length - 1 ; i >= 0 ; i-- ) {
            // Shorten array if possible
            if ( this.units[i] == null ) {
                this.units.length = i;
            } else {
                break;
            }
        }
    }
 

    //---------------------
    spawnUnit( type , x, z , owner ) {

        let spawn_clock = 1;

        if ( type == "skeleton" ) {
            
            this.createUnit( type, x - 0.1 , z - 0.1 , owner);
            this.createUnit( type, x + 0.1 , z - 0.1 , owner);
            this.createUnit( type, x  , z + 0.1 , owner);
        

        } else if ( type == "archer" ) {

            this.createUnit( type, x - 0.1 , z  , owner);
            this.createUnit( type, x + 0.1 , z  , owner);
            

        } else if ( type == "goblin" ) {
        
            this.createUnit( type, x - 0.1 , z - 0.1 , owner);
            this.createUnit( type, x + 0.1 , z - 0.1 , owner);
            this.createUnit( type, x  , z + 0.1 , owner);
        
        } else if ( type == "goblinspear" ) {
        
            this.createUnit( type, x - 0.1 , z - 0.1 , owner);
            this.createUnit( type, x + 0.1 , z - 0.1 , owner);
            this.createUnit( type, x  , z + 0.1 , owner);
            

        } else if ( type == "gargoylehorde" ) {

            this.createUnit( type, x - 0.1 , z - 0.1 , owner);
            this.createUnit( type, x + 0.1 , z - 0.1 , owner);
            this.createUnit( type, x - 0.1 , z + 0.1 , owner);
            this.createUnit( type, x + 0.1 , z + 0.1 , owner);


        } else if ( type == "spell_fireball" ) {
            
            spawn_clock = 0;
            // createProjectile( src_v3, dst_v3 , owner , projectile_type , attacktarget, damage , damage_building ) {

            this.createProjectile(  
                new Vector3(0,  10 , 0),
                new Vector3(x,   2, z),
                owner,
                3,
                null,
                572,
                172
            );

        } else if ( type == "spell_zap" ) {
            
            spawn_clock = 0;
            //createExplosion( location_v3 ,  owner ,  scale_x , scale_y , explosion_type, damage , damage_building ) {

            this.createExplosion( 
                    new Vector3( x , 1.5 , z ), 
                    owner, 
                    3,
                    3,
                    2,
                    159,
                    48
                );

       
        } else { 
            this.createUnit( type, x  , z , owner);
        } 

        if ( spawn_clock == 1 ) {
            this.createClock( new Vector3(x, 2.5 ,z ) );
        }
    }


    /*
        
                                Dmg         HP          Hitspeed  Radius
        Skeleton                67          67            1
        Giant                   211         3275        1.5             
        Knight                  167         1452        1.2
        Archer                   89         252         1.2
        Wizard                  234         598         1.4
        Goblin                   90         167         1.1
        Megaminion              161         695         1.6
        MinionHorde              84         190           1


        Fireball                572(172)                            2.5                 
        Zap                     159(48)                             2.5
        Goblin Hut              
        Tomb Stone                                  
        Hogrider                264         1408       1.6
        Prince                  325         1669       1.4
        Goblin Spear             67         110        1.7
        Pekka                   678         3125       1.8

    */

    //---------------------
    createUnit( type , x, z , owner ) {

    	log( "createUnit" , type, x, z , owner);

    	let y ;
    	let modelsize;
    	let b2dsize;
    	let model;
    	
        let isFlying     = 0;
        let isSpawner     = 0;

        let speed        = 5;
        let maxhp:number = 67;
        
        let attackSpeed  = 30;
        let damage:number = 67;

        let healthbar_y  = 3;
        let projectile_user = 0;

        let attack_building_only = 0;

        let attackRange = 0.3;
        let aggrorange  = 3.0;


    	// Box2d's collision grouping
    	let categoryBits = 1;
    	let maskBits 	 = 1;


    	if ( type == "skeleton" ) {
    		y 			= 1.6;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.skeleton;

            damage      = 67;
            maxhp       = 67;
            attackSpeed = 30;

            speed       = 5;

           
    	
    	} else if ( type == "giant" ) {

    		y 			= 1.85;
    		modelsize 	= 0.20;
    		b2dsize  	= 0.25;
    		model 		= resources.models.giant;

            damage      = 211;
            maxhp       = 3275;
            attackSpeed = 45;

            speed       = 5;




            healthbar_y = 4;
            attack_building_only = 1;

            
    	
    	} else if ( type == "knight" ) {

    		y 			= 1.71;
    		modelsize 	= 0.18
    		b2dsize  	= 0.15;
    		model 		= resources.models.knight;

            damage      = 167;
            maxhp       = 1452;
            attackSpeed = 36;

            speed       = 5;


    	
    	} else if ( type == "archer" ) {

    		y 			= 1.65;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.archer;
            

            damage      = 89;
            maxhp       = 252;
            attackSpeed = 36;
            
            speed       = 5;



            attackRange = 5.0;
            projectile_user = 1;




    	
    	} else if ( type == "wizard" ) {

    		y 			= 1.65;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.wizard;

    	    damage      = 234;
            maxhp       = 598;
            attackSpeed = 42;
            
            speed       = 5;

            attackRange = 5.0;
            projectile_user = 1;
            

    	
    	} else if ( type == "goblin" ) {

    		y 			= 1.6;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.goblin;
    		speed 		= 5.0;

    		damage      = 90;
            maxhp       = 167;
            attackSpeed = 33;
            
            speed       = 20;


    	} else if ( type == "gargoyle" ) {
    		
    		y 			= 2.5;
    		modelsize 	= 0.18;
    		b2dsize  	= 0.18;
    		model 		= resources.models.gargoyle;
    		isFlying    = 1;
            
            damage      = 161;
            maxhp       = 695;
            attackSpeed = 48;
            speed       = 5;


    	} else if ( type == "gargoylehorde" ) {
    		y 			= 2.5;
    		modelsize 	= 0.12;
    		b2dsize  	= 0.12;
    		model 		= resources.models.gargoyle;
    		isFlying    = 1;
            
            damage      = 84;
            maxhp       = 190;
            attackSpeed = 30;
            speed       = 5;


            
    	} else if ( type == "goblinspear" ) {
            y           = 1.6;
            modelsize   = 0.15;
            b2dsize     = 0.15;
            model       = resources.models.goblinspear;
            
            damage      = 67;
            maxhp       = 110;
            attackSpeed = 33;
            speed       = 20;

            attackRange = 5.0;
            projectile_user = 1;


        } else if ( type == "prince" ) {

            y           = 1.85;
            modelsize   = 0.18;
            b2dsize     = 0.15;
            model       = resources.models.prince;
            

            damage      = 325;
            maxhp       = 1669;
            attackSpeed = 42;

            speed       = 15;



        } else if ( type == "hogrider" ) {

            y           = 1.85;
            modelsize   = 0.15;
            b2dsize     = 0.15;
            model       = resources.models.hogrider;
            
            damage      = 264;
            maxhp       = 1408;
            attackSpeed = 48;
            speed       = 15;


        } else if ( type == "pekka" ) {

            y           = 1.6;
            modelsize   = 0.15;
            b2dsize     = 0.2;
            model       = resources.models.pekka;

            damage      = 678;
            maxhp       = 3125;
            attackSpeed = 54;
            speed       = 5;




        } else if ( type == "tombstone" ) {

            y           = 1.55;
            modelsize   = 0.24;
            b2dsize     = 0.24;
            model       = resources.models.tombstone;

            damage      = 0;
            maxhp       = 422;
            attackSpeed = 120;
            speed       = 0;
            isSpawner    = 1;


         } else if ( type == "goblinhut" ) {

            y           = 1.85;
            modelsize   = 0.26;
            b2dsize     = 0.3;
            model       = resources.models.goblinhut;

            damage      = 0;
            maxhp       = 844;
            attackSpeed = 135;
            speed       = 0;
            isSpawner    = 1;
        }





        let unit:Txunit;
        let recyclable_index = this.getRecyclableUnit( type );

        if ( recyclable_index >= 0 ) {

            unit = this.units[recyclable_index];
            unit.transform.position = new Vector3( x, y, z );
            unit.transform.scale    = new Vector3( modelsize, modelsize, modelsize );
            unit.owner = owner;
            
            unit.isFlying = isFlying;
            unit.aggroRange = aggrorange;
            
            unit.reinstate_box2d( {
                scale   : new Vector3( b2dsize , b2dsize , b2dsize )
            });
            if ( unit.owner == 1 ) {
                unit.healthbar.getComponent( Material ).albedoColor = Color3.FromInts( 255, 0, 0 );
            } else {
                unit.healthbar.getComponent( Material ).albedoColor = Color3.FromInts( 0, 0, 200 );
            }
            unit.tick = 0;
            unit.attacktarget = null ;
            unit.movetarget   = null ;
            unit.attacking    = 0;
            unit.healthbar.getComponent( Transform ).scale.x = 1.5;
            unit.stopAnimation("Punch");
            unit.playAnimation("Walking",1);
            unit.visible = 1;


            log( "reuse unit entity " , unit.type, unit.id , " inited. arr len", this.units.length );

        } else {

            unit = new Txunit(
                        this.units.length,
                        this,
                        {
                            position: new Vector3( x , y ,  z ),
                            scale   : new Vector3( modelsize, modelsize, modelsize )
                        },
                        {
                            scale   : new Vector3( b2dsize , b2dsize , b2dsize )
                        },
                        model,
                        type,
                        ( isSpawner == 1 ) ? "static" : "dynamic",
                        owner,
                        isFlying,
                        aggrorange,
                        healthbar_y
                    );

            
            recyclable_index = this.getRecyclableUnitIndex();

            if ( recyclable_index == -1 ) {
                this.units.push( unit );
            } else {
                unit.id = recyclable_index;
                this.units[recyclable_index] = unit;
            }	
        
            log( "Unit " , unit.type, unit.id , " inited. arr len", this.units.length );
        
        }





        unit.curhp       = maxhp;
        unit.maxhp       = maxhp;
    	unit.attackRange = attackRange;
    	unit.speed 		 = speed;
        unit.attackSpeed = attackSpeed;
        unit.damage      = damage;
        unit.projectile_user = projectile_user;
        unit.attack_building_only = attack_building_only;
        unit.dead       = 3;
        unit.isSpawner  = isSpawner;

        
        if ( unit.owner == -1 ) {
            unit.transform.rotation.eulerAngles = new Vector3( 0, 180 ,0) ;
        } else {
            unit.transform.rotation.eulerAngles = new Vector3( 0, 0 ,0) ;
        }        

        this.sounds["spawn"].playOnce();

        //unit.speed = 0;
        

    	if ( unit.isFlying == 1 ) {
    		categoryBits = 2;
    		maskBits     = 2;
    	}
    	unit.box2dbody.m_fixtureList.m_filter.categoryBits = categoryBits;
		unit.box2dbody.m_fixtureList.m_filter.maskBits     = maskBits;

		
    	return unit;
    }





    //-----------------------------------------------------------
    public all_available_cards = [ "skeleton", "giant" , "knight", "archer" , "wizard" , "goblin" , "gargoyle" , "gargoylehorde", "spell_fireball","spell_zap", "goblinhut", "tombstone", "hogrider", "prince", "goblinspear" ,"pekka" ];
    public all_available_cards_mana = [ 15 , 60, 50, 30,  50, 30, 40, 50,  40, 20, 50,40,   40, 50, 30, 70];
    public all_available_cards_isspell = [ 0 , 0 , 0 , 0 ,    0 , 0, 0, 0,     1 , 1 ,0, 0,    0, 0, 0, 0 ];


     //----
    init_player_cards_collection() {

        this.player_cards_collection.length = 0;

        
        let i;
       
        let card_sel_parent = new Entity();
        card_sel_parent.addComponent( new Transform( {
            position: new Vector3( -8 , 2,  -2 )
        }));
        card_sel_parent.setParent( this );
        card_sel_parent.addComponent( new Billboard( false, true, false ) );

        this.card_sel_parent = card_sel_parent;
        

        // So that can rotate 180 independantly of billboard
        let card_sel_3d_ui = new Entity();
        card_sel_3d_ui.setParent(card_sel_parent);
        
        let card_sel_3d_ui_transform = new Transform( {
            position: new Vector3( 0, 0, 0 ),
        });
        card_sel_3d_ui.addComponent( card_sel_3d_ui_transform );  
        card_sel_3d_ui_transform.rotation.eulerAngles = new Vector3( 0 , 180, 0 );


        
        // Card selected highlight 
        let card_sel_highlight_material = new Material();
        card_sel_highlight_material.emissiveColor = Color3.Green();
        card_sel_highlight_material.emissiveIntensity = 3;
        

        
        // Individual cards
        for ( i = 0 ; i < 16 ; i++ ) {

            let x = ( i % 4 ) * 1.2;
            let y = ((i / 4)  >> 0 ) * 1.2;
            let z = 0;

            let card_type = this.all_available_cards[i];
            let card_mana = this.all_available_cards_mana[i];

            let txcard = new Txcard(
                i ,
                card_sel_3d_ui,
                {
                    position: new Vector3( x, y, z),
                    scale   : new Vector3(1, 1, 1)
                },
                card_type,
                this,
                card_sel_highlight_material
            );

            txcard.isSpell = this.all_available_cards_isspell[i] ;



            txcard.manaCost = card_mana;
            this.player_cards_collection.push( txcard );
        }

        

     }



	//-----------------
	construct_box2d_shapes( ) {

    	let vertices = [];	
    	let xoffset = 0;
    	let yoffset = 0;
		
		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   -6,  -9   ) ); 
		vertices.push(  new b2Vec2(   -5,  -9   ) );   
		vertices.push(  new b2Vec2(   -5,   9   ) );   
		vertices.push(  new b2Vec2(   -6,    9   ) );   

		this.createStaticShape( xoffset , yoffset , vertices , this.world );

		vertices.length = 0 ;
		vertices.push(  new b2Vec2(    5,  -9   ) ); 
		vertices.push(  new b2Vec2(    6,  -9   ) );   
		vertices.push(  new b2Vec2(    6,   9   ) );   
		vertices.push(  new b2Vec2(    5,   9   ) );   

		this.createStaticShape( xoffset , yoffset , vertices , this.world );

		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   -5,  -9   ) ); 
		vertices.push(  new b2Vec2(    5,  -9   ) );   
		vertices.push(  new b2Vec2(    5,  -8   ) );   
		vertices.push(  new b2Vec2(   -5,  -8   ) );   

		this.createStaticShape(xoffset , yoffset , vertices , this.world );

		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   -5,   8   ) ); 
		vertices.push(  new b2Vec2(    5,   8   ) );   
		vertices.push(  new b2Vec2(    5,   9   ) );   
		vertices.push(  new b2Vec2(   -5,   9   ) );   
		
		this.createStaticShape(xoffset , yoffset , vertices , this.world );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   -5,   -0.5   ) ); 
		vertices.push(  new b2Vec2(   -3.6,   -0.5   ) );   
		vertices.push(  new b2Vec2(   -3.6,   0.5   ) );   
		vertices.push(  new b2Vec2(   -5,   0.5   ) );   
		
		this.createStaticShape( xoffset , yoffset , vertices , this.world );


		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   -2.4,   -0.5   ) ); 
		vertices.push(  new b2Vec2(    2.4,   -0.5   ) );   
		vertices.push(  new b2Vec2(    2.4,   0.5   ) );   
		vertices.push(  new b2Vec2(   -2.4,   0.5   ) );   
		
		this.createStaticShape( xoffset , yoffset , vertices , this.world );
		
		vertices.length = 0 ;
		vertices.push(  new b2Vec2(    3.6,   -0.5   ) ); 
		vertices.push(  new b2Vec2(    5,   -0.5   ) );   
		vertices.push(  new b2Vec2(    5,   0.5   ) );   
		vertices.push(  new b2Vec2(    3.6,   0.5   ) );   
		
		this.createStaticShape( xoffset , yoffset , vertices , this.world );
			


	}

	//----------
    createStaticShape( x, y , vertices, world ) {
    	return this.createShape( x, y, world,  b2BodyType.b2_staticBody, vertices );
    }

     //------------
    createShape( x, y, world, body_type , vertices  ) {

    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 10;
        fixDef.friction     = 100;
        fixDef.restitution  = 0.5;
        fixDef.shape        = new b2PolygonShape();

        fixDef.shape.Set( vertices , vertices.length );

        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);
        return b2body;
    }

    //-------------
    createDynamicBox( x, y , width , height , world  ) {
    	return this.createBox( x,y,width,height, world,  b2BodyType.b2_dynamicBody );
    }	
    //------------------
    createStaticBox( x, y , width , height , world  ) {
    	return this.createBox( x,y,width,height, world,  b2BodyType.b2_staticBody );
    }
    //-------------------
    createBox( x, y , width , height , world , body_type ) {
    	
    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 1.0;
        fixDef.friction     = 0.00;
        fixDef.restitution  = 0.1;
        fixDef.shape        = new b2PolygonShape();
        fixDef.shape.SetAsBox( width/2 , height/2 );

        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);

        return b2body;
    }

      //-------------
    createDynamicCircle( x, y , radius , world , ccd  ) {
    	return this.createCircle( x,y, radius , world,  b2BodyType.b2_dynamicBody , ccd );
    }		
	
	 //-------------
    createStaticCircle( x, y , radius , world  ) {
    	return this.createCircle( x,y, radius , world,  b2BodyType.b2_staticBody , false );
    }		

    //----------------
    createCircle( x,y, radius , world, body_type , ccd ) {

    	// Box2D
    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
        bodyDef.bullet  = ccd;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 20;
        fixDef.friction     = 100;
        fixDef.restitution  = 0.3;
        fixDef.shape        = new b2CircleShape(radius);
        
        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);
        b2body.SetLinearDamping(1);
		b2body.SetAngularDamping(1);


        return b2body;

    }

    //-------------
    createDynamicSensorCircle( x,y, radius , world, sensorid ) {

    	// Box2D
    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= b2BodyType.b2_dynamicBody;
        bodyDef.userData  = sensorid;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 0.0;
        fixDef.friction     = 0.0;
        fixDef.restitution  = 0.0;
        fixDef.shape        = new b2CircleShape(radius);
        fixDef.isSensor 	= true;
        
        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);

        return b2body;

	}
}




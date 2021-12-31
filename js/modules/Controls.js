import * as dat from "dat.gui";

export default class Controls{
    constructor(params){
        this.params = params;
        this.init();
    }

    init(){
        this.gui = new dat.GUI({width: 300});
        this.gui.add(this.params, "mouse_force",20, 200);
        this.gui.add(this.params, "cursor_size", 10, 200);
        this.gui.add(this.params, "isViscous");
        this.gui.add(this.params, "viscous", 0, 500);
        this.gui.add(this.params, "iterations_viscous", 1, 32);
        this.gui.add(this.params, "iterations_poisson", 1, 32);
        this.gui.add(this.params, "dt", 1/200, 1/30);
        this.gui.add(this.params, 'BFECC');
        this.gui.close();
    }

}
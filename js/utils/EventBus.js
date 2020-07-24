class EventBus{
    /**
     * Initialize a new event bus instance.
     */
    constructor(){
        this.bus = document.createElement('fakeelement');
    }

    /**
     * Add an event listener.
     */
    on(event, callback){
        this.bus.addEventListener(event, callback);
    }

    /**
     * Remove an event listener.
     */
    off(event, callback){
        this.bus.removeEventListener(event, callback);
    }

    /**
     * Dispatch an event.
     */
    emit(event, detail = {}){
        this.bus.dispatchEvent(new CustomEvent(event, { detail }));
    }
}

export default new EventBus();
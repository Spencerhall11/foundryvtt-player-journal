

export class PlayerJournal extends Application{

        static get defaultOptions(){
            return mergeObject(super.defaultOptions,{
                id: "player-journal",
                title: "Personal Log",
                template: "modules/foundryvtt-player-journal/templates/journal.html",
                width: 600,
                height: 500,
                resizable: true

            });
        }

    async getData(){
        return{
            userId: game.user.id,
            userName: game.user.name,
            isGM: game.user.isGM
        };
    }

    activateListeners(html){
        super.activateListeners(html);
        html.find(".journal-personal").click(() => this._openPersonal());
        html.find(".journal-party").click(() => this._openParty());
        html.find(".journal-group").click((e) => this._openGroup(e.currentTarget.dataset.groupId));
        html.find(".journal-codex").click(() => this._openCodex());
        html.find(".create-group").click(() => this._createGroup());
    }

    static open(){
        new PlayerJournal().render(true);
    }

    _openPersonal() {};
    _openParty() {};
    _openGroup(groupId) {};
    _openCodex() {};
    _createGroup() {};
}


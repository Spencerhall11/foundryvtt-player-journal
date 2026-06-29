

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
    const allGroups = game.settings.get("foundryvtt-player-journal", "group-journals");
    
    // filter for groups player is in
    const groups = Object.values(allGroups)
        .filter(g => g.members.includes(game.user.id))
        .map(g => ({
            id: g.id,
            name: g.name,
            memberCount: g.members.length
        }));

    return {
        userId: game.user.id,
        userName: game.user.name,
        isGM: game.user.isGM,
        groups
        };
    }

    async _createGroup() {
    // get all players except the current user
    const otherPlayers = game.users
            .filter(u => !u.isGM && u.id !== game.user.id)
            .map(u => `<label>
                <input type="checkbox" value="${u.id}"> ${u.name}
            </label>`)
            .join("");

        // build dialog content
    const content = `
            <div class="pj-create-group">
                <label>Group Name</label>
                <input type="text" id="group-name" placeholder="Enter group name..."/>
                <label>Invite Members</label>
                <div class="pj-member-list">${otherPlayers}</div>
            </div>
        `;

        new Dialog({
            title: "Create Group",
            content,
            buttons: {
                create: {
                    label: "Create",
                    callback: async (html) => {
                        await this._saveNewGroup(html);
                    }
                },
                cancel: { label: "Cancel" }
            }
        }).render(true);
    }

    async _saveNewGroup(html) {
    const name = html.find("#group-name").val().trim();
    if (!name) return ui.notifications.warn("Group needs a name.");

    // get selected member IDs
    const members = [];
    html.find(".pj-member-list input:checked").each((i, el) => {
        members.push(el.value);
    });

    // always include creator
    members.push(game.user.id);

    // build group
    const id = foundry.utils.randomID();
    const group = {
        id,
        name,
        createdBy: game.user.id,
        members
    };

    // save settings
    const allGroups = game.settings.get("foundryvtt-player-journal", "group-journals");
    allGroups[id] = group;
    await game.settings.set("foundryvtt-player-journal", "group-journals", allGroups);

    // refresh landing
    this.render(false);
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
}


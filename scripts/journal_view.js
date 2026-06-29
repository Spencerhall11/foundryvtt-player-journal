export class JournalView extends Application{


 constructor(title, journal, saveFn) {
        super();
        this.journalTitle = title;
        this.journal = journal;
        this.saveFn = saveFn;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "journal-view",
            template: "modules/foundryvtt-player-journal/templates/entry.html",
            width: 680,
            height: 600,
            resizable: true
        });
    }

    get title() {
    return this.journalTitle;
    }

    async getData() {
    return {
        title: this.journalTitle,
        entries: this.journal.entries ?? []
    };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".new-entry").click(() => this._newEntry());
        html.find(".edit-entry").click((e) => this._editEntry(e.currentTarget.dataset.entryId));
        html.find(".delete-entry").click((e) => this._deleteEntry(e.currentTarget.dataset.entryId));
        html.find(".pj-tab").click((e) => this._switchTab(e.currentTarget.dataset.tab));
    }

    async _newEntry() {
        const content = `
            <div class="pj-new-entry">
                <input type="text" id="entry-title" placeholder="Entry title..."/>
                <textarea id="entry-body" rows="6" placeholder="Write your notes here..."></textarea>
                <input type="text" id="entry-tags" placeholder="Tags (comma separated)..."/>
            </div>
        `;

        new Dialog({
            title: "New Entry",
            content,
                buttons: {
                    save: {
                        label: "Save",
                        callback: async (html) => {
                            await this._saveNewEntry(html);
                        }
                    },
                    cancel: { label: "Cancel" }
                }
        }).render(true);
    }
    
    async _editEntry(entryId) {
        const entry = this.journal.entries.find(e => e.id === entryId);
    if (!entry) return;

    const content = `
        <div class="pj-new-entry">
            <input type="text" id="entry-title" value="${entry.title}"/>
            <textarea id="entry-body" rows="6">${entry.body}</textarea>
            <input type="text" id="entry-tags" value="${entry.tags.join(", ")}"/>
        </div>
    `;

    new Dialog({
        title: "Edit Entry",
        content,
        buttons: {
            save: {
                label: "Save",
                callback: async (html) => {
                    entry.title = html.find("#entry-title").val().trim();
                    entry.body = html.find("#entry-body").val().trim();
                    entry.tags = html.find("#entry-tags").val().split(",").map(t => t.trim()).filter(t => t);
                    await this.saveFn(this.journal);
                    this.render(false);
                }
                },
                cancel: { label: "Cancel" }
            }
        }).render(true);
    }

    async _deleteEntry(entryId) {
         this.journal.entries = this.journal.entries.filter(e => e.id !== entryId);
        await this.saveFn(this.journal);
        this.render(false);
    }

    async _switchTab(tab) {}

    async _saveNewEntry(html) {
        const title = html.find("#entry-title").val().trim();
        const body = html.find("#entry-body").val().trim();
        const tags = html.find("#entry-tags").val().split(",").map(t => t.trim()).filter(t => t);

        if (!title) return ui.notifications.warn("Entry needs a title.");

        const entry = {
            id: foundry.utils.randomID(),
            title,
            body,
            tags,
            createdBy: game.user.name,
            timestamp: new Date().toLocaleString()
            };

            this.journal.entries.push(entry);
            await this.saveFn(this.journal);
            this.render(false);
        }

}
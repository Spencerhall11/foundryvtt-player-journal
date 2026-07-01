export class JournalView extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: "journal-view",
        window: { title: "Journal" },
        position: { width: 680, height: 600 },
        resizable: true
    };

    static PARTS = {
        main: {
            template: "modules/foundryvtt-player-journal/templates/entry.html"
        }
    };

    constructor(title, journal, saveFn, options = {}) {
        super(options);
        this.journalTitle = title;
        this.journal = journal;
        this.saveFn = saveFn;
    }

    get title() {
        return this.journalTitle;
    }

    async _prepareContext() {
        return {
            title: this.journalTitle,
            entries: this.journal.entries ?? []
        };
    }

    _onRender(context, options) {
        document.body.appendChild(this.element);
        this.element.style.position = "fixed";
        this.element.style.zIndex = "99999";
        this.element.style.top = "100px";
        this.element.style.left = "200px";
    
        this.element.querySelector(".new-entry")?.addEventListener("click", () => this._newEntry());
        this.element.querySelectorAll(".edit-entry").forEach(el => {
         el.addEventListener("click", (e) => this._editEntry(e.currentTarget.dataset.entryId));
        });
        this.element.querySelectorAll(".delete-entry").forEach(el => {
            el.addEventListener("click", (e) => this._deleteEntry(e.currentTarget.dataset.entryId));
        });
    }

    async _newEntry() {
        await foundry.applications.api.DialogV2.prompt({
            window: { title: "New Entry" },
            content: `
                <form>
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" name="entry-title" placeholder="Entry title..."/>
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea name="entry-body" rows="6" placeholder="Write your notes here..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Tags</label>
                        <input type="text" name="entry-tags" placeholder="Tags (comma separated)..."/>
                    </div>
                </form>`,
            ok: {
                label: "Save",
                callback: async (event, button) => {
                    const form = button.form;
                    const title = form.elements["entry-title"].value.trim();
                    const body = form.elements["entry-body"].value.trim();
                    const tags = form.elements["entry-tags"].value.split(",").map(t => t.trim()).filter(t => t);
                    if (!title) return ui.notifications.warn("Entry needs a title.");
                    const entry = {
                        id: foundry.utils.randomID(),
                        title, body, tags,
                        createdBy: game.user.name,
                        timestamp: new Date().toLocaleString()
                    };
                    this.journal.entries.push(entry);
                    await this.saveFn(this.journal);
                    this.render();
                }
            }
        });
    }

    async _editEntry(entryId) {
        const entry = this.journal.entries.find(e => e.id === entryId);
        if (!entry) return;
        await foundry.applications.api.DialogV2.prompt({
            window: { title: "Edit Entry" },
            content: `
                <form>
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" name="entry-title" value="${entry.title}"/>
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea name="entry-body" rows="6">${entry.body}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Tags</label>
                        <input type="text" name="entry-tags" value="${entry.tags.join(", ")}"/>
                    </div>
                </form>`,
            ok: {
                label: "Save",
                callback: async (event, button) => {
                    const form = button.form;
                    entry.title = form.elements["entry-title"].value.trim();
                    entry.body = form.elements["entry-body"].value.trim();
                    entry.tags = form.elements["entry-tags"].value.split(",").map(t => t.trim()).filter(t => t);
                    await this.saveFn(this.journal);
                    this.render();
                }
            }
        });
    }

    async _deleteEntry(entryId) {
        this.journal.entries = this.journal.entries.filter(e => e.id !== entryId);
        await this.saveFn(this.journal);
        this.render();
    }
}
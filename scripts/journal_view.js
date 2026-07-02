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
        // Tab switching
this.element.querySelectorAll(".pj-tab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const entryId = e.currentTarget.dataset.entryId;
        const tab = e.currentTarget.dataset.tab;
        this._switchTab(entryId, tab);
    });
});

// Initialize canvases
this.element.querySelectorAll(".pj-sketch-canvas").forEach(canvas => {
    this._initCanvas(canvas);
});

// Load existing sketches
this.element.querySelectorAll(".pj-sketch-canvas").forEach(canvas => {
    const entryId = canvas.dataset.entryId;
    const entry = this.journal.entries.find(e => e.id === entryId);
    if (entry?.sketch) {
        const img = new Image();
        img.onload = () => canvas.getContext("2d").drawImage(img, 0, 0);
        img.src = entry.sketch;
    }
});

// Clear sketch buttons
this.element.querySelectorAll(".pj-clear-sketch").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const entryId = e.currentTarget.dataset.entryId;
        const canvas = this.element.querySelector(`.pj-sketch-canvas[data-entry-id="${entryId}"]`);
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        this._saveSketch(entryId, canvas);
    });
});

// Copy sketch buttons
this.element.querySelectorAll(".copy-sketch").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const entryId = e.currentTarget.dataset.entryId;
        const canvas = this.element.querySelector(`.pj-sketch-canvas[data-entry-id="${entryId}"]`);
        canvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({"image/png": blob})]));
        ui.notifications.info("Sketch copied to clipboard.");
    });
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

                    if (!this.journal.entries) this.journal.entries = [];
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

    _switchTab(entryId, tab) {
    const card = this.element.querySelector(`.pj-entry-card[data-entry-id="${entryId}"]`);
    card.querySelectorAll(".pj-tab-btn").forEach(b => b.classList.remove("pj-tab-active"));
    card.querySelector(`.pj-tab-btn[data-tab="${tab}"]`).classList.add("pj-tab-active");
    card.querySelectorAll(".pj-tab-content").forEach(c => c.style.display = "none");
    card.querySelector(`.pj-tab-${tab}`).style.display = "block";
}

_initCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    let drawing = false;

    canvas.addEventListener("mousedown", (e) => {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!drawing) return;
        const colorPicker = this.element.querySelector(`.pj-color-picker[data-entry-id="${canvas.dataset.entryId}"]`);
        const brushSize = this.element.querySelector(`.pj-brush-size[data-entry-id="${canvas.dataset.entryId}"]`);
        ctx.strokeStyle = colorPicker?.value ?? "#000000";
        ctx.lineWidth = brushSize?.value ?? 4;
        ctx.lineCap = "round";
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    });

    canvas.addEventListener("mouseup", async () => {
        drawing = false;
        await this._saveSketch(canvas.dataset.entryId, canvas);
    });

    canvas.addEventListener("mouseleave", async () => {
        if (drawing) {
            drawing = false;
            await this._saveSketch(canvas.dataset.entryId, canvas);
        }
    });
}

async _saveSketch(entryId, canvas) {
    const entry = this.journal.entries.find(e => e.id === entryId);
    if (!entry) return;
    entry.sketch = canvas.toDataURL("image/png");
    await this.saveFn(this.journal);
}

}
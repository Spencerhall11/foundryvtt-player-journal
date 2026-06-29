

//acts one and states that the journal is initialized when it opens
Hooks.once("init", () => {
        //register the settings
        game.settings.register("foundryvtt-player-journal", "personal-journals", {
        scope: "world",
        config: false,
        type: Object,
        default: {}
        });
        game.settings.register("foundryvtt-player-journal", "party-journals", {
        scope: "world",
        config: false,
        type: Object,
        default: {}
        });
        game.settings.register("foundryvtt-player-journal", "group-journals", {
        scope: "world",
        config: false,
        type: Object,
        default: {}
        });
        game.settings.register("foundryvtt-player-journal", "journal-sketches", {
        scope: "world",
        config: false,
        type: Object,
        default: {}
        });
        game.settings.register("foundryvtt-player-journal", "player-codex", {
        scope: "world",
        config: false,
        type: Object,
        default: {}
        });
        game.settings.register("foundryvtt-player-journal", "button-position", {
        scope: "client",
        config: false,
        type: Object,
        default: { top: 5, left: 40 }   
        });

    console.log("Player Journal | Initialized");
});

//states the module is ready
Hooks.once("ready", () => {
    //make button
    const btn = document.createElement("button");
    const pos = game.settings.get("foundryvtt-player-journal", "button-position")
    btn.innerHTML = `<i class="fas fa-book"></i>`;
    btn.title = "Player Journal";
    //style and location 
    btn.style.cssText = `
        position: fixed;
        top:  ${pos.top}px;
        left: ${pos.left}%;
        z-index: 99999;
        width: 40px;
        height: 40px;
        border-radius: 6px;
        background: #0a0a1a;
        border: 1px solid #00ffcc;
        color: #00ffcc;
        font-size: 16px;
        cursor: pointer;
    `;

    //click handling
    let wasDragged = false;
    btn.addEventListener("click", () => {
        if (wasDragged) {
        wasDragged = false;
        return;
        }
        PlayerJournal.open();
    });

    //button drag logic
    let isDragging = false;
    let offsetX, offsetY;
    btn.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - btn.getBoundingClientRect().left;
        offsetY = e.clientY - btn.getBoundingClientRect().top;
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        btn.style.left = (e.clientX - offsetX) + "px";
        btn.style.top = (e.clientY - offsetY) + "px";
    });

    document.addEventListener("mouseup", async () => {
        if (!isDragging) return;
        wasDragged = true;
        isDragging = false;
        // save position
        await game.settings.set("foundryvtt-player-journal", "button-position", {
            top: parseInt(btn.style.top),
            left: parseInt(btn.style.left)
        });
    });

    //inject page
    document.body.appendChild(btn);

    console.log("Player Journal | Ready");
});
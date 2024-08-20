import { setTempUnblock } from "./storage";

(() => {
    const tempUnblockButton = document.querySelector("#tempUnblockButton");
    if (!tempUnblockButton) return false;
    console.log("asdasd");

    tempUnblockButton.addEventListener("click", async () => {
        console.log("click");
        await setTempUnblock(true);
        window.location.reload();
    });
})();

import { Stack } from "./Stack";
import { Toast } from "./Toast";

document.addEventListener('DOMContentLoaded', async () => {
    const stack = new Stack();
    await stack.init();

    async function create() {
        const window = await fin.Window.create({
            name: `toast-${Math.floor(Math.random() * 1000)}`,
            autoShow: true,
            opacity: 0,
            defaultWidth: 400,
            defaultHeight: 150,
            saveWindowState: false
        });

        stack.add(new Toast(window, {x: 400, y: 150}));
    }

    function clear(index?: number) {
        if (index === undefined) {
            index = Math.floor(Math.random() * stack.length);
        }

        const toast = stack.get(index);
        if (toast) {
            toast.dismiss();
        }
    }

    function close(index?: number) {
        if (index === undefined) {
            index = Math.floor(Math.random() * stack.length);
        }

        const toast = stack.get(index);
        if (toast) {
            toast.close();
        }
    }
    
    function clearAll() {
        for(let i=stack.length-1; i>=0; i--) {
            stack.get(i).dismiss();
        }
    }
    
    function closeAll() {
        for(let i=stack.length-1; i>=0; i--) {
            stack.get(i).close();
        }
    }

    const children = await fin.Application.getCurrentSync().getChildWindows();
    children.forEach(child => child.close(true));

    Object.assign(window, {stack});

    document.getElementById('create1')!.onclick = create;
    document.getElementById('create2')!.onclick = () => { create(); create(); };
    document.getElementById('create5')!.onclick = () => { create(); create(); create(); create(); create(); };
    document.getElementById('clearOld')!.onclick = () => { clear(0); };
    document.getElementById('clearNew')!.onclick = () => { clear(stack.length - 1); };
    document.getElementById('clearRandom')!.onclick = () => { clear(); };
    document.getElementById('clearRandom2')!.onclick = () => { clear(); clear(); };
    document.getElementById('closeOld')!.onclick = () => { close(0); };
    document.getElementById('closeNew')!.onclick = () => { close(stack.length - 1); };
    document.getElementById('closeRandom')!.onclick = () => { close(); };
    document.getElementById('closeRandom2')!.onclick = () => { close(); close(); };
    document.getElementById('clearAll')!.onclick = clearAll;
    document.getElementById('closeAll')!.onclick = closeAll;
});

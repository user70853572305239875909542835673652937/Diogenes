declare module 'puppeteer-extra' {
    import * as puppeteer from 'puppeteer';
    interface PuppeteerExtra extends puppeteer.PuppeteerNode {
        use(plugin: any): PuppeteerExtra;
    }
    const puppeteerExtra: PuppeteerExtra;
    export = puppeteerExtra;
}

declare module 'puppeteer-extra-plugin-stealth' {
    const stealth: () => any;
    export = stealth;
}

declare module 'chrome-paths' {
    export const chrome: string;
}

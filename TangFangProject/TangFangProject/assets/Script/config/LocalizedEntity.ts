// LocalizedEntity.ts


import LanguageMgr from "../lang/LanguageMgr";


export class LocalizedEntity {
    private propertyMappings: { [key: string]: string } = {}; // 属性名 -> 多语言键的映射

    constructor(propertyMappings: { [key: string]: string }) {
        this.propertyMappings = propertyMappings;
        // this.createProxy();
        this.generateGetters();
    }

    // 动态生成getter方法
    private generateGetters(): void {
        for (const propertyName in this.propertyMappings) {
            if (this.propertyMappings.hasOwnProperty(propertyName)) {
                // 为每个属性定义一个getter
                Object.defineProperty(this, propertyName, {
                    get: () => {
                        const i18nKey = this.propertyMappings[propertyName] + "_" + this['id'];
                        // LocalizationManager.instance.getLocalizedString(i18nKey);
                        // return LanguageMgr.getInstance().getCfgLang(i18nKey);
                        return i18nKey;
                    },

                    set: (v) => {

                    },
                    enumerable: true,
                    configurable: true
                });
            }
        }
    }
}
import {
	addIcon,
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import OSS from "ali-oss";

interface Settings {
	accessKeyId: string;
	accessKeySecret: string;
	region: string;
	bucket: string;
	service: string;
}

const defaultSettings: Settings = {
	accessKeyId: "",
	accessKeySecret: "",
	region: "",
	bucket: "",
	service: "",
};

export default class MyPlugin extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadingSetting();
		// init oss client
		let client: OSS;
		const basePath = this.app.vault.adapter.basePath;
		const fs = this.app.vault.adapter.fs;

		// if setting params init OSS
		if (
			this.settings.accessKeyId &&
			this.settings.accessKeySecret &&
			this.settings.region &&
			this.settings.bucket &&
			this.settings.service
		) {
			client = new OSS({
				accessKeyId: this.settings.accessKeyId,
				accessKeySecret: this.settings.accessKeySecret,
				region: this.settings.region,
				bucket: this.settings.bucket,
			});
		}

		// sync Icon
		addIcon(
			"syncIcon",
			`<svg t="1650276986341" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2766" width="100" height="100"><path d="M811.4 368.9C765.6 248 648.9 162 512.2 162S258.8 247.9 213 368.8C126.9 391.5 63.5 470.2 64 563.6 64.6 668 145.6 752.9 247.6 762c4.7 0.4 8.7-3.3 8.7-8v-60.4c0-4-3-7.4-7-7.9-27-3.4-52.5-15.2-72.1-34.5-24-23.5-37.2-55.1-37.2-88.6 0-28 9.1-54.4 26.2-76.4 16.7-21.4 40.2-36.9 66.1-43.7l37.9-10 13.9-36.7c8.6-22.8 20.6-44.2 35.7-63.5 14.9-19.2 32.6-36 52.4-50 41.1-28.9 89.5-44.2 140-44.2s98.9 15.3 140 44.3c19.9 14 37.5 30.8 52.4 50 15.1 19.3 27.1 40.7 35.7 63.5l13.8 36.6 37.8 10c54.2 14.4 92.1 63.7 92.1 120 0 33.6-13.2 65.1-37.2 88.6-19.5 19.2-44.9 31.1-71.9 34.5-4 0.5-6.9 3.9-6.9 7.9V754c0 4.7 4.1 8.4 8.8 8 101.7-9.2 182.5-94 183.2-198.2 0.6-93.4-62.7-172.1-148.6-194.9z" p-id="2767" fill="#d4237a"></path><path d="M376.9 656.4c1.8-33.5 15.7-64.7 39.5-88.6 25.4-25.5 60-39.8 96-39.8 36.2 0 70.3 14.1 96 39.8 1.4 1.4 2.7 2.8 4.1 4.3l-25 19.6c-5.3 4.1-3.5 12.5 3 14.1l98.2 24c5 1.2 9.9-2.6 9.9-7.7l0.5-101.3c0-6.7-7.6-10.5-12.9-6.3L663 532.7c-36.6-42-90.4-68.6-150.5-68.6-107.4 0-195 85.1-199.4 191.7-0.2 4.5 3.4 8.3 8 8.3H369c4.2-0.1 7.7-3.4 7.9-7.7zM703 664h-47.9c-4.2 0-7.7 3.3-8 7.6-1.8 33.5-15.7 64.7-39.5 88.6-25.4 25.5-60 39.8-96 39.8-36.2 0-70.3-14.1-96-39.8-1.4-1.4-2.7-2.8-4.1-4.3l25-19.6c5.3-4.1 3.5-12.5-3-14.1l-98.2-24c-5-1.2-9.9 2.6-9.9 7.7l-0.4 101.4c0 6.7 7.6 10.5 12.9 6.3l23.2-18.2c36.6 42 90.4 68.6 150.5 68.6 107.4 0 195-85.1 199.4-191.7 0.2-4.5-3.4-8.3-8-8.3z" p-id="2768" fill="#d4237a"></path></svg>`
		);
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"syncIcon",
			"Sync",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon
				// new Modal(this.app).open();
				console.log(basePath);
				console.log(fs);
			}
		);
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This creates a tab in the settings panel.
		this.addSettingTab(new SyncSetting(this.app, this));
	}

	onunload() {}

	async loadingSetting() {
		this.settings = Object.assign(
			{},
			defaultSettings,
			await this.loadData()
		);
	}

	async saveSetting() {
		await this.saveData(this.settings);
	}
}

class SyncSetting extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Settings your OSS account." });
		new Setting(containerEl).setName("accessKeyId").addText((text) =>
			text
				.setPlaceholder("Enter your accessKeyId")
				.setValue(this.plugin.settings.accessKeyId)
				.onChange(async (value) => {
					this.plugin.settings.accessKeyId = value;
					await this.plugin.saveSetting();
				})
		);
		new Setting(containerEl).setName("accessKeySecret").addText((text) =>
			text
				.setPlaceholder("Enter your accessKeySecret")
				.setValue(this.plugin.settings.accessKeySecret)
				.onChange(async (value) => {
					this.plugin.settings.accessKeySecret = value;
					await this.plugin.saveSetting();
				})
		);
		new Setting(containerEl).setName("region").addText((text) =>
			text
				.setPlaceholder("Enter your region")
				.setValue(this.plugin.settings.region)
				.onChange(async (value) => {
					this.plugin.settings.region = value;
					await this.plugin.saveSetting();
				})
		);
		new Setting(containerEl).setName("bucket").addText((text) =>
			text
				.setPlaceholder("Enter your bucket")
				.setValue(this.plugin.settings.bucket)
				.onChange(async (value) => {
					this.plugin.settings.bucket = value;
					await this.plugin.saveSetting();
				})
		);
		new Setting(containerEl).setName("service").addText((text) =>
			text
				.setPlaceholder("Enter your service")
				.setValue(this.plugin.settings.service)
				.onChange(async (value) => {
					this.plugin.settings.service = value;
					await this.plugin.saveSetting();
				})
		);
	}
}

let Command = require('commander').Command;

class CliRunner {

	constructor(core) {
		if (!core) {
			throw new Error('Core object required');
		}

		this.core = core;
		this.watch = null;
	}

	async run(options) {
		this.program = new Command();

		// CLI version.
		if (options.version) {
			this.program.version(options.version);
		}

		// CLI description.
		if (options.description) {
			this.program.description(options.description);
		}

		// Global options.
		if (options.options) {
			for (let option of options.options) {
				this.program.option(...option);
			}
		}

		// Make sure all modules are loaded.
		await this.core.loadModules();

		// Get all commands
		this.commands = await this.core.loadObjects('cliCommands', this);

		for (let command of this.commands) {
			if (!command.syntax) {
				throw new Error('Command syntax is missing');
			} else if (!command.action) {
				throw new Error('No action defined for command: ' + command.syntax);
			}

			let cmd = this.program.command(command.syntax);

			// Command description.
			if (command.description) {
				cmd.description(command.description);
			}

			// Command options.
			if (command.options) {
				for (let option of command.options) {
					cmd.option(...option);
				}
			}

			cmd.action(function (...args) {
				let result = command.action(...args);

				if (result instanceof Promise) {
					this.watch = result;
				} else {
					this.watch = new Promise(function (resolve) { resolve(true); });
				}
			});
		}


		let result = this.program.parse(options.argv || process.argv);

		await this.watch;

		return result;
	}
}

module.exports = CliRunner;

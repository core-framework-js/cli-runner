let assert = require('chai').assert;

let coreFramework = require('@core-framework/core');
let CliRunner = require('../CliRunner');


class CliTestModule extends coreFramework.Module {
	constructor(...commands) {
		super('cli', 1);
		this.commands = commands;
	}

	getCliCommands() {
		return this.commands;
	}
}


async function createRunner(...commands) {
	let core = new coreFramework.Core('core');
	let cli = new CliRunner(core);
	let mod = new CliTestModule(...commands);

	core.addModule(mod);

	return cli;
}

describe('CliRunner', () => {
	it('exists', () => {
		assert.isFunction(CliRunner);
	});

	describe('constructor', () => {
		it('throws if no core object is given', async () => {
			try {
				new CliRunner();
			} catch (e) {
				return;
			}

			throw new Error('Expected an exception');
		});

		it('accepts core instance', () => {
			let core = new coreFramework.Core('core');
			let cli = new CliRunner(core);

			assert.property(cli, 'core');
			assert.equal(cli.core, core);
		});
	});

	describe('run()', () => {
		it('exists', async () => {
			let cli = await createRunner();

			assert.property(cli, 'run');
			assert.isFunction(cli.run);
		});

		it('throws if no options are given', async () => {
			let cli = await createRunner();

			try {
				await cli.run();
			} catch (e) {
				return;
			}

			throw new Error('Expected exception');
		});

		it('accepts empty options', async () => {
			let cli = await createRunner();

			await cli.run({});
		});


		it('will fail if command action is missing', async () => {
			let cli = await createRunner({
				syntax: 'test'
			});

			try {
				await cli.run({});
			} catch (e) {
				return;
			}

			throw new Error('Exception was expected');
		});

		it('will fail if command syntax is missing', async () => {
			let cli = await createRunner({
				action: () => {
				}
			});

			try {
				await cli.run({});
			} catch (e) {
				return;
			}

			throw new Error('Exception was expected');
		});


		it('will run synchronous command', async () => {
			let success = false;
			let cli = await createRunner({
				syntax: 'test1',
				action: function () {
					success = true;
				}
			});

			await cli.run({
				argv: ['', '', 'test1']
			});


			assert.ok(success);
		});

		it('will run asynchronous command', async () => {
			let success = false;
			let cli = await createRunner({
				syntax: 'test',
				action: async function () {
					success = true;
				}
			});

			await cli.run({
				argv: ['', '', 'test']
			});

			assert.ok(success);
		});

		it('accepts options', async () => {
			let success = false;
			let cli = await createRunner({
				syntax: 'test',
				action: function () {
					success = true;
				}
			});

			await cli.run({
				description: 'description',
				version: '1.0',
				argv: ['', '', 'test']
			});

			assert.ok(success);
			assert.equal(cli.program.description(), 'description');
			assert.equal(cli.program.version(), '1.0');
		});

		it('accepts extra command options', async () => {
			let success = false;
			let cli = await createRunner({
				syntax: 'test',
				description: 'description',
				options: [
					['-f, --foo', 'Foo!']
				],
				action: function (options) {
					if (options.foo) {
					success = true;
					}
				}
			});

			await cli.run({
				argv: ['', '', 'test', '--foo']
			});

			assert.ok(success);
		});


		it('accepts extra global options', async () => {
			let success = false;
			let cli = await createRunner({
				syntax: 'test',
				description: 'description',
				options: [
					['-f, --foo', 'Foo!']
				],
				action: async function (options) {
					if (options.foo && options.parent.bar) {
						success = true;
					}
				}
			});

			await cli.run({
				options: [
					['-b, --bar', 'Bar!']
				],
				argv: ['', '', 'test', '--foo', '--bar']
			});



			assert.ok(success);
		});
	});
});

'use strict';

import { Command } from 'commander';
import prompts from 'prompts';
import readline from 'node:readline';
import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { EventEmitter } from 'node:events';
import { Interface } from 'node:readline';
const JsonTemplate: PackageJsonType = {
  name: '',
  version: '1.0.0',
  description: '',
  main: 'index.js',
  scripts: {
    test: 'echo "Error: no test specified" && exit 1',
  },
  keywords: [],
  author: '',
  license: 'ISC',
  dependencies: {},
  devDependencies: {},
};

export class JsonUtil {
  #json = JsonTemplate;
  load(j: string) {
    try {
      this.#json = JSON.parse(j);
    } catch (e: unknown) {
      throw new Error((e as Error).message);
    }
  }
  getJson() {
    return structuredClone(this.#json);
  }
  freeJson() {
    this.#json = JsonTemplate;
  }
}

export class FileUtil {
  static resolveFilePath(file: string) {
    try {
      if (path.extname(file) !== '.json')
        throw new Error('File must be a JSON file.');
      if (!fs.existsSync(file)) throw new Error('File does not exists.');
      file = path.resolve(file);
      if (!file.startsWith(fs.realpathSync(os.homedir())))
        throw new Error('Given file should be under your home directory.');
      return file;
    } catch (e: unknown) {
      throw new Error((e as Error).message);
    }
  }
  static createFile(file: string) {
    try {
      if (path.extname(file) !== '.json')
        throw new Error('File must be a JSON file.');
      if (fs.existsSync(file)) throw new Error('File already exists.');
      file = path.resolve(file);
      if (!file.startsWith(fs.realpathSync(os.homedir())))
        throw new Error('Given file should be under your home directory.');
      fs.writeFileSync(file, '');
      return file;
    } catch (e: unknown) {
      throw new Error((e as Error).message);
    }
  }
}
type OnStateVal = {
  value: string;
  exited: boolean;
  aborted: boolean;
};
export class CommandUtil {
  mainCommandProgram() {
    const opts = {
      opts: {},
      action: '',
      actionOpts: {},
    };

    const program = new Command();

    program
      .name('cmd-util')
      .description('CLI to some JavaScript cmd utilities')
      .version('0.0.0')
      .option('-p, --path <string>', 'path')
      .action((o: { path: string }) => {
        opts.opts = o;
        opts.action = 'main';
      });

    program
      .command('create')
      .description('create')
      .option('-f, --file <string>', 'file')
      .action((o: { file: string }) => {
        opts.actionOpts = o;
        opts.action = 'create';
      });

    program
      .command('copy')
      .description('copy')
      .option('-s, --src <string>', 'src file')
      .option('-d, --dest <string>', 'dest file')
      .action((o: { src: string; dest: string }) => {
        opts.actionOpts = o;
        opts.action = 'copy';
      });

    program
      .command('update')
      .description('update')
      .option('-s, --src <string>', 'src file')
      .action((o: { src: string }) => {
        opts.actionOpts = o;
        opts.action = 'update';
      });

    program.parse();

    return opts;
  }
  static async createPackageJsonPrompts() {
    let asked = false;
    const opts: PackageJsonType = {
      name: '',
      version: '1.0.0',
      description: '',
      main: 'index.js',
      scripts: {
        test: 'echo "Error: no test specified" && exit 1',
      },
      keywords: [],
      author: '',
      license: 'ISC',
      dependencies: {},
      devDependencies: {},
    };
    await prompts([
      {
        type: 'text',
        name: 'name',
        message: 'What is your package name?',
        validate: (value: string) => {
          return value.length < 1 ? 'Please enter a package name.' : true;
        },
        onState(val: OnStateVal) {
          opts.name = val.value;
        },
      },
      {
        type: 'text',
        name: 'version',
        message: 'What is your package current version?',
        initial: '1.0.0',
        onState(val: OnStateVal) {
          opts.version = val.value;
        },
      },
      {
        type: 'text',
        name: 'description',
        message: 'Tell us something about your package!',
        onState(val: OnStateVal) {
          opts.description = val.value;
        },
      },
      {
        type: 'text',
        name: 'main',
        message: 'Name the script file that will serve as an entry point?',
        initial: 'index.js',
        onState(val: OnStateVal) {
          opts.main = val.value;
        },
      },
      {
        type: 'text',
        name: 'test',
        message: 'What will your test command will look like?',
        initial: 'echo "Error: no test specified" && exit 1',
        onState(val: OnStateVal) {
          opts.scripts.test = val.value;
        },
      },
      {
        type: 'text',
        name: 'keywords',
        message: 'Add some keywords!',
        onState(val: OnStateVal) {
          opts.keywords = val.value.length > 0 ? val.value.split(' ') : [];
        },
      },
      {
        type: 'text',
        name: 'author',
        message: 'Who is the author of this package?',
        onState(val: OnStateVal) {
          opts.author = val.value;
        },
      },
      {
        type: 'select',
        name: 'license',
        message: 'Add a license?',
        choices: [
          { title: 'ISC', value: 'ISC' },
          { title: 'MIT', value: 'MIT' },
        ],
        onState(val: OnStateVal) {
          opts.license = val.value;
        },
      },
      {
        type: 'confirm',
        name: 'value',
        message: 'Is this ok?',
        initial: true,
        onRender() {
          if (!asked) console.log(opts);
          this.message = 'Is this ok?';
          asked = true;
        },
        onState(val: OnStateVal) {
          opts['value'] = val.value;
        },
      },
    ]);
    return opts;
  }
}

export class BaseCmd extends EventEmitter {
  #rl: Interface | null = null;
  constructor() {
    super();
  }
  async readline() {
    this.#rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> ',
    });
    if (this.#rl) {
      this.#rl.prompt();
      this.#rl
        .on('line', async (line: string) => {
          line = line.trim();
          if (line == '.exit') {
            this.#rl != null && this.#rl.close();
            this.#rl = null
            //process.exit(0);
          }
          this.emit('event', line);
          this.#rl != null && this.#rl.prompt();
        })
        .on('close', () => {
          //console.log('close!');
        });
    }
  }
}

type Opts = {
  action: string;
  opts?: {
    path?: string;
  };
  actionOpts: {
    file?: string;
  };
};

type PackageJsonType = {
  name: string;
  version: string;
  description: string;
  main: string;
  scripts: {
    test: string;
  };
  keywords: string[];
  author: string;
  license: string;
  dependencies: object;
  devDependencies: object;
  value?: string;
};

export class Cmd extends BaseCmd {
  #action = 'main';
  #cmd = new CommandUtil();
  json: PackageJsonType = {
    name: '',
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
    },
    keywords: [],
    author: '',
    license: 'ISC',
    dependencies: {},
    devDependencies: {},
  };
  constructor() {
    super();
    this.on('event', line => {
      //console.log('Child: an event occurred!', line);
      this.processLineEvent(line);
    });
  }
  async run() {
    const opts: Opts = this.#cmd.mainCommandProgram();
    console.log(opts);
    await this.processMainCommandprogram(opts);
  }
  async processMainCommandprogram(opts: Opts) {
    switch (opts?.action) {
      case 'main': {
        this.#action = 'main';
        console.log('Welcome!');
        console.log('Type ".help" for more information.');
        console.log('');
        if (opts?.opts?.path) {
          const p = FileUtil.resolveFilePath(opts?.opts?.path);
          const json = new JsonUtil();
          json.load(fs.readFileSync(p).toString());
          this.json = json.getJson();
          json.freeJson();
        }
        await this.readline();
        break;
      }
      case 'create': {
        this.#action = 'create';
        const saveFile = async (file: string) => {
          const response: PackageJsonType =
            await CommandUtil.createPackageJsonPrompts();
          if (response?.value) {
            delete response.value;
            fs.writeFileSync(file, JSON.stringify(response, null, '  '));
          }
        };
        if (opts.actionOpts?.file) {
          const f: string = opts.actionOpts?.file || '';
          if (f.trim()) {
            const p = FileUtil.resolveFilePath(f);
            saveFile(p);
          } else {
            throw new Error('No file specified');
          }
        } else {
          const p = FileUtil.resolveFilePath('./package.json');
          saveFile(p);
        }
        break;
      }
      default: {
        this.#action = 'main';
        await this.readline();
      }
    }
  }
  processLineEvent(line: string) {
    switch (this.#action) {
      case 'main': {
        switch (line.trim()) {
          case '.print': {
            if (this.json) {
              console.log(this.json);
            }
            break;
          }
          case '.help': {
            console.log('.help: Prints the help message.');
            console.log('.print: Prints json.');
            console.log('.exit: Exits the program.');
            console.log('');
            console.log(
              '(To exit, press Ctrl+C again or Ctrl+D or type .exit)',
            );
            break;
          }
        }
        break;
      }
    }
  }
}

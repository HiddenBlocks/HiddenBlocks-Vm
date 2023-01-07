const formatMessage = require('format-message');
const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
// const Cast = require('../../util/cast');

const proxy = "https://proxy.jwklong.repl.co"
const prefix = "https://postlit.dev/"

/**
 * Class for PostLit blocks
 * @constructor
 */
class jwPostLit {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    loginData = {
        username: '',
        token: ''
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'jwPostLit',
            name: 'postLit',
            //blockIconURI: blockIconURI,
            color1: '#14f789',
            color2: '#0fd173',
            blocks: [
                {
                    opcode: 'categorySignIn',
                    text: formatMessage({
                        id: 'jwPostLit.blocks.categorySignIn',
                        default: 'Sign In',
                        description: 'Sign in to postLit.'
                    }),
                    blockType: BlockType.LABEL
                },
                {
                    opcode: 'signIn',
                    text: formatMessage({
                        id: 'jwPostLit.blocks.signIn',
                        default: 'sign in [USER] [PASS]',
                        description: 'Sign in to postLit.'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.COMMAND,
                    arguments: {
                        USER: {
                            type: ArgumentType.STRING,
                            defaultValue: "username"
                        },
                        PASS: {
                            type: ArgumentType.STRING,
                            defaultValue: "password"
                        }
                    }
                },
                {
                    opcode: 'currentUsername',
                    text: formatMessage({
                        id: 'jwPostLit.blocks.currentUsername',
                        default: 'username',
                        description: 'Username for your postLit account.'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'currentToken',
                    text: formatMessage({
                        id: 'jwPostLit.blocks.currentToken',
                        default: 'token',
                        description: 'Token for your postLit account.'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'isSignedIn',
                    text: formatMessage({
                        id: 'jwPostLit.blocks.isSignedIn',
                        default: 'signed in?',
                        description: 'Checks if you are currently signed into a postLit account.'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.BOOLEAN,
                }
            ]
        };
    }

    async signIn(args, util) {
        const username = String(args.USER)
        const password = String(args.PASS)
        var response = await fetch(proxy, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: prefix + "signin",
                body: {
                    username: username,
                    password: password
                }
            })
        })
        var data = await response.json()
        if (data.success) {
            this.loginData = {
                username: username,
                token: data.token
            }
        }
    }

    currentUsername(args, util) {
        return this.loginData.username
    }

    currentToken(args, util) {
        return this.loginData.token
    }

    isSignedIn(args, util) {
        return this.loginData.token !== ''
    }
}

module.exports = jwPostLit;

const formatMessage = require('format-message');
const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const Cast = require('../../util/cast');
const Ammo = require('ammojs3');



/**
 * Class for 3d++ blocks
 * @constructor
 */
class Fr3DBlocks {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.world = function(){return null}
        this._3d = function(){return null}
        this.Three = function(){return null}
        if(!vm.runtime.ext_jg3d){vm.extensionManager.loadExtensionURL('jg3d');this._3d = vm.runtime.ext_jg3d;this.Three = this._3d.three;}
        this.animate = function(){
            requestAnimationFrame(animate);
            physicsWorld.stepSimulation(1 / 60, 10)
        }
        this.enablePhysicsForObjectByName = function(objectName) {
            var object = this._3d.scene.getObjectByName(objectName);

            if (!!object) {

                var collisionShape = new Ammo.btBoxShape(new Ammo.btVector3(object.scale.x / 2, object.scale.y / 2, object.scale.z / 2));

                var mass = 1; 
                var startTransform = new Ammo.btTransform();
                startTransform.setIdentity();
                var localInertia = new Ammo.btVector3(0, 0, 0);
                collisionShape.calculateLocalInertia(mass, localInertia);
                startTransform.setOrigin(new Ammo.btVector3(object.position.x, object.position.y, object.position.z));
                var motionState = new Ammo.btDefaultMotionState(startTransform);
                var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, collisionShape, localInertia);
                var rigidBody = new Ammo.btRigidBody(rbInfo);

                this.world.addRigidBody(rigidBody);

                object.onBeforeRender = function () {
                var transform = new Ammo.btTransform();
                rigidBody.getMotionState().getWorldTransform(transform);
                var origin = transform.getOrigin();
                object.position.set(origin.x(), origin.y(), origin.z());
                };
            }
        }
        this.disablePhysicsForObjectByName = function(objectName){
            var object = this._3d.scene.getObjectByName(objectName);
            if (!!object) {
                this.world.removeRigidBody(object.userData.rigidBody);
                object.onBeforeRender = null;
            }
        };
    }
    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        
        return {
            id: 'fr3d',
            name: '3d Physics',
            color1: '#D066FE',
            color2: '#8000BC',
            blocks: [
                {
                    opcode: 'setup',
                    text: 'setup simulation',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME1: { type: ArgumentType.STRING, defaultValue: "Cube1" }
                    }
                },
                {
                    opcode: 'step',
                    text: 'step simulation',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'enablep',
                    text: 'enable physics for [NAME1]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME1: { type: ArgumentType.STRING, defaultValue: "Cube1" }
                    }
                },
                {
                    opcode: 'disablep',
                    text: 'disable physics for [NAME1]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME1: { type: ArgumentType.STRING, defaultValue: "Plane1" }
                    }
                }
            ]
        };
    }
    setup() {
        var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        var overlappingPairCache = new Ammo.btDbvtBroadphase();
        var solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.world = new Ammo.btDiscreteDynamicsWorld(
        dispatcher,
        overlappingPairCache,
        solver,
        collisionConfiguration
        );
        this.world.setGravity(new Ammo.btVector3(0, -9.8, 0));
    }
    enablep(args) {
        this.enablePhysicsForObjectByName(Cast.toString(args.NAME1));
    }
    disablep(args) {
        this.disablePhysicsForObjectByName(Cast.toString(args.NAME1))
    }
    step() {this.animate();}
}

module.exports = Fr3DBlocks;
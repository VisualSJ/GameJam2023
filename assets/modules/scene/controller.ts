/**
 * 场景控制器
 * 负责管理场景里的元素生成、移动、变化
 * 以及管理场景内的一些数据，例如碰撞
 */

import {
    _decorator,
    Component,
    Node,
    Vec2,
    Vec3,
    Prefab,
    instantiate,
    Animation,
} from 'cc';
import { bucket } from '../player/bucket/bucket';
import { emmiter } from '../player/emmiter/emmiter';
import type { start } from './start/start';

const { ccclass, property,type } = _decorator;

enum GameState {
    STOP = 0,
    START = 1,
}

@ccclass('sceneController')
export class sceneController extends Component {

    @property({
        type: Prefab,
    })
    emmiter: Prefab | null = null;

    @property({
        type: Node,
    })
    emmiterList: Node | null = null;

    @property({type: Node})
    bucketList: Node | null = null ;

    @property({type: Node})
    pointList: Node | null = null ;

    // 发射方向
    @property({
        type: Vec2,
    })
    direction: Vec2 = new Vec2(0, 2);

    // 随机位置大小
    @property
    randomSize: number = 20;

    // 发射速度
    @property
    emmiterSpeed: number = 30;
    // 转弯力度
    @property
    public turningStrength = 1

    @property({
        type: Node,
    })
    gameEndNode: Node | null = null;

    // 发射初始位置
    @property({
        type: Vec2,
    })
    beginPosition: Vec2 = new Vec2(0, 0);

    current: GameState = GameState.STOP;

    start() {
        this.current = GameState.START;
        this.pauseButton.active = false
        this.pauseBG.active = false
    }

    update(deltaTime: number) {
        const bucketFull = this.bucketList && this.bucketList.children.every((node) => {
            const comp = node.getComponent('bucket') as bucket;
            if (comp) {
                return comp.progress >= 100;
            }
        });
        this.emmiterList && this.emmiterList.children.forEach((node) => {
            const comp = node.getComponent('emmiter') as emmiter;
            if (comp) {
                comp.setSpeed( this.emmiterSpeed)
                comp.controlPointArray = this.pointList.children
                comp.bucketPointArray = this.bucketList.children
                comp.widthSpeed = this.turningStrength
                comp.updater(deltaTime);
            }
        })
        if (bucketFull) {
            this._onBucketFull();
        }
    }

    // 自定义函数

    /**
     * 在 x,y 位置生成一个地块
     */
    generateMotion() {
        const node = instantiate(this.emmiter.data);
        const comp = node.getComponent('emmiter');
        comp.moveVector = new Vec3(
            this.direction.x + Math.random() / 5,
            this.direction.y + Math.random() / 5,
            0,
        );
        node.position = new Vec3(this.beginPosition.x + Math.random() * this.randomSize, this.beginPosition.y + Math.random() * this.randomSize, 0);
        this.emmiterList.addChild(node);

        setTimeout(() => {
            this.emmiterList.removeChild(node);
        }, 3000);
    }

    /**
     * 当所有桶收集满了之后触发的回调
     */
    _onBucketFull() {
        if (this.current !== GameState.START) {
            return;
        }
        this.current = GameState.STOP;
        
        this.bucketList && this.bucketList.children.forEach((node) => {
            const comp = node.getComponent('bucket') as bucket;
            if (comp) {
                comp.lockMaxVolume();
            }
        });
        
        if (this.gameEndNode) {
            this.gameEndNode.active = true;
            const comp = this.gameEndNode.getComponent(Animation);
            comp.play('game-end');
        }
    }

    @property({
        type:Node
    })
    descriptionNode:Node | null = null
    startGame(){
        this.descriptionNode.active = false
        this.pauseButton.active = true
        this.current = GameState.START
        this.resumeGame()
    }

    @property({
        type:Node
    })
    pauseButton:Node | null = null

    @property({
        type:Node
    })
    pauseBG:Node | null = null
    pauseGame(){
        this.pauseBG.active = true
        this.pauseButton.active = false
    }

    resumeGame(){
        this.pauseBG.active = false
        this.pauseButton.active = true
    }
    quitGame(){
        this.nextScene(-1)
    }
    restartGame(){
        this.nextScene()
        this.prevScene()
    }
    nextScene(index?:number) {
        const startNode = this.node.getParent().getParent();
        const startComp = startNode.getComponent('start') as start;
        startComp.nextScene(null,index);
    }
    prevScene() {
        const startNode = this.node.getParent().getParent();
        const startComp = startNode.getComponent('start') as start;
        startComp.prevScene();
    }
}


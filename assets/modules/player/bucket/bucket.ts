import {
    _decorator,
    CCInteger,
    Component,
    Contact2DType,
    Node,
    IPhysics2DContact,
    PhysicsSystem2D,
    Vec3,
    AudioSource,
    Tween
} from 'cc';
import { throttle } from '../../utils';

const { ccclass, property } = _decorator;

@ccclass('bucket')
export class bucket extends Component {

    @property({ type: Node })
    background: Node | null = null;

    @property({ type: Node })
    content: Node | null = null;

    @property({
        type: CCInteger,
        slide: true,
        min: 0,
        max: 100,
    })
    get progress() {
        return this._progress;
    }
    set progress(val: number) {
        this._progress = Math.min(Math.max(val, 0), 100);

        this._updateContentProgress();
        this._updateAudio();
    }
    @property({ type: CCInteger })
    _progress: number = 0;
    public audio: AudioSource = null!;

    tween:Tween<bucket> = null;

    _updateContentProgress() {
        this.content.scale = new Vec3(1, this._progress / 100, 1);
    }

    _updateAudio() {
        if (this.audio) {
            this.audio.volume = this._progress / 100;
        }
    }

    // @property
    // counterDelayTime:number = 10
    start() {
        this.audio = this.node.getComponent(AudioSource);
        this.tween = new Tween(this)
        // this.addCounter = throttle(this.addCounter, this.counterDelayTime);
    }

    addingLastFrame = 0
    update(deltaTime: number) {
        this.addingLastFrame++
    }
    // 音量上升速度
    // @property({
    //     type: CCInteger,
    //     slide: true,
    //     min: 0,
    //     max: 100,
    //     step:1
    // })

    addCounter() {
        this.tween.stop()
        this.progress += 25;
        this.addingLastFrame = 0
        setTimeout(() => {
            if(this.addingLastFrame<36)return;
            this.tween.to(2.2,{progress:0}).start()
        }, 3000)
    }
}



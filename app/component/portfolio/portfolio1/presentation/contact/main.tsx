'use client'
import style from './page.module.scss'

export function Contact() {

    return (
        <section data-section="contact" className={style.contact} data-scroll-reveal>
            <div className={style.header} data-scroll-reveal>
                <div className={style.open_to_work}>
                    <span>
                        <svg className={style.child} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M176,128a48,48,0,1,1-48-48A48,48,0,0,1,176,128Z" opacity="0.2"></path><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm0-144a56,56,0,1,0,56,56A56.06,56.06,0,0,0,128,72Zm0,96a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z"></path></svg>
                        <span className={style.child}>Open to work</span>
                    </span>
                </div>
                <h2>
                    <span className="cursor-light">LET'S MAKE YOUR VISION</span>
                    <span className="cursor-light">UNFORGETTABLE</span>
                </h2>
            </div>
        </section>
    );
}
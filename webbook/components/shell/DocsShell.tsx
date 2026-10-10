"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Toc } from "./Toc";
import { PanelIcon } from "./icons";
import styles from "./Docs.module.css";

/** The Shannon library docs layout: sidebar, article, and "On this page". */
export function DocsShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  useEffect(() => {
    try { setCollapsed(localStorage.getItem("rfm-sidebar") === "collapsed"); } catch {}
  }, []);
  const toggle = (v: boolean) => {
    setCollapsed(v);
    try { localStorage.setItem("rfm-sidebar", v ? "collapsed" : "open"); } catch {}
  };
  return (
    <div className={styles.layout} data-collapsed={collapsed} data-drawer={drawer}>
      <Sidebar onCollapse={() => toggle(true)} onNavigate={() => setDrawer(false)} />
      <button className={styles.drawerScrim} aria-label="Close contents" onClick={() => setDrawer(false)} tabIndex={drawer ? 0 : -1} />
      <div className={styles.mainWrap}>
        <div className={styles.subbar}>
          <button className={styles.menuBtn} onClick={() => setDrawer(true)} aria-label="Open contents">
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            Contents
          </button>
          {collapsed && (
            <button className={styles.expandBtn} onClick={() => toggle(false)} aria-label="Show sidebar" title="Show sidebar">
              <PanelIcon />
            </button>
          )}
        </div>
        <main id="content" className={styles.main}>
          <div className={styles.article}>{children}</div>
          <Toc />
        </main>
      </div>
    </div>
  );
}

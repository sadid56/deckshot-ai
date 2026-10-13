import sys
from datetime import datetime
from typing import Any, Dict, Optional


class _ChalkStyle:
    """Internal zero-dependency terminal styler inspired by chalk.

    Used strictly inside the logger to format console outputs.
    """

    def __init__(self, codes: Optional[list] = None):
        self._codes = codes or []

    def _clone(self, code: int) -> "_ChalkStyle":
        return _ChalkStyle(self._codes + [code])

    def __call__(self, text: Any) -> str:
        s = str(text)
        if not self._codes:
            return s
        prefix = "".join(f"\033[{c}m" for c in self._codes)
        return f"{prefix}{s}\033[0m"

    @property
    def bold(self) -> "_ChalkStyle":
        return self._clone(1)

    @property
    def dim(self) -> "_ChalkStyle":
        return self._clone(2)

    @property
    def italic(self) -> "_ChalkStyle":
        return self._clone(3)

    @property
    def underline(self) -> "_ChalkStyle":
        return self._clone(4)

    @property
    def red(self) -> "_ChalkStyle":
        return self._clone(31)

    @property
    def green(self) -> "_ChalkStyle":
        return self._clone(32)

    @property
    def yellow(self) -> "_ChalkStyle":
        return self._clone(33)

    @property
    def blue(self) -> "_ChalkStyle":
        return self._clone(34)

    @property
    def magenta(self) -> "_ChalkStyle":
        return self._clone(35)

    @property
    def cyan(self) -> "_ChalkStyle":
        return self._clone(36)

    @property
    def white(self) -> "_ChalkStyle":
        return self._clone(37)

    @property
    def gray(self) -> "_ChalkStyle":
        return self._clone(90)


# Internal chalk instance for the logger
_chalk = _ChalkStyle()


class Logger:
    """Professional, centralized logger.

    All terminal colors, chalk styling, badges, and formatting are handled
    internally here. Consumers only need: `from src.logger import logger`
    """

    def __init__(self, scope: str = ""):
        self.scope = scope

    def _timestamp(self) -> str:
        return _chalk.gray(datetime.now().strftime("[%H:%M:%S]"))

    def _prefix(self) -> str:
        ts = self._timestamp()
        if self.scope:
            return f"{ts} {_chalk.bold.magenta(f'[{self.scope}]')} "
        return f"{ts} "

    def info(self, msg: str):
        badge = _chalk.bold.cyan("ℹ️  INFO   ")
        print(f"{self._prefix()}{badge} {msg}", file=sys.stdout, flush=True)

    def success(self, msg: str):
        badge = _chalk.bold.green("✅ SUCCESS ")
        print(f"{self._prefix()}{badge} {_chalk.green(msg)}", file=sys.stdout, flush=True)

    def warn(self, msg: str):
        badge = _chalk.bold.yellow("⚠️  WARN    ")
        print(f"{self._prefix()}{badge} {_chalk.yellow(msg)}", file=sys.stdout, flush=True)

    def warning(self, msg: str):
        self.warn(msg)

    def error(self, msg: str):
        badge = _chalk.bold.red("❌ ERROR   ")
        print(f"{self._prefix()}{badge} {_chalk.bold.red(msg)}", file=sys.stderr, flush=True)

    def stage(self, stage_name: str, msg: str = ""):
        badge = _chalk.bold.blue(f"🎬 [{stage_name}]")
        extra = f" {msg}" if msg else ""
        print(f"{self._prefix()}{badge}{extra}", file=sys.stdout, flush=True)

    def step(self, current: int, total: int, msg: str):
        badge = _chalk.bold.cyan(f"➡️  [{current}/{total}]")
        print(f"{self._prefix()}{badge} {msg}", file=sys.stdout, flush=True)

    def model(self, model_id: str, msg: str, level: str = "info"):
        badge = _chalk.bold.magenta(f"⚡ [{model_id.upper()}]")
        ts = self._timestamp()
        if level == "error":
            print(f"{ts} {badge} {_chalk.bold.red('❌ ' + msg)}", file=sys.stderr, flush=True)
        elif level == "success":
            print(f"{ts} {badge} {_chalk.bold.green('✅ ' + msg)}", file=sys.stdout, flush=True)
        elif level == "warn":
            print(f"{ts} {badge} {_chalk.bold.yellow('⚠️  ' + msg)}", file=sys.stdout, flush=True)
        else:
            print(f"{ts} {badge} {msg}", file=sys.stdout, flush=True)

    def metric(self, label: str, value: Any, color: str = "cyan"):
        color_fn = getattr(_chalk.bold, color, _chalk.bold.cyan)
        print(f"{self._prefix()}{_chalk.bold(label)}: {color_fn(value)}", file=sys.stdout, flush=True)

    def banner(self, title: str):
        border = _chalk.gray("=" * 64)
        print(f"\n{border}", flush=True)
        print(f"{_chalk.bold.cyan('🎬 ' + title)}", flush=True)
        print(f"{border}\n", flush=True)

    def model_card(self, model: Dict[str, Any]):
        """Render a formatted model engine info card in the terminal."""
        status = _chalk.bold.green("✅ Ready") if model.get("installed") else _chalk.bold.yellow("⚠️  Missing Dependencies (run --install-deps)")
        print(f"\n🔹 {_chalk.bold.cyan('Model ID:')}     {_chalk.bold.magenta(model.get('id', ''))}")
        print(f"   {_chalk.bold('Name:')}         {model.get('name', '')}")
        print(f"   {_chalk.bold('Status:')}       {status}")
        print(f"   {_chalk.bold('Default FPS:')}  {model.get('default_fps', 25)} FPS")
        print(f"   {_chalk.bold('Hardware:')}     {model.get('recommended_hardware', '')}")
        print(f"   {_chalk.bold('Description:')}  {_chalk.gray(model.get('description', ''))}")
        deps = model.get("dependencies", [])
        print(f"   {_chalk.bold('Dependencies:')} {_chalk.dim(', '.join(deps))}")

    def get_scoped(self, scope: str) -> "Logger":
        return Logger(scope=scope)


logger = Logger()


def get_logger(scope: str = "") -> Logger:
    return Logger(scope=scope)

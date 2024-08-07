# FFXIV HQ Helper: DAWNTRAIL

![GitHub License](https://img.shields.io/github/license/InfSein/hqhelper-dawntrail?style=flat&logo=github) ![GitHub Repo stars](https://img.shields.io/github/stars/InfSein/hqhelper-dawntrail?style=flat&logo=github) ![Github Created At](https://img.shields.io/github/created-at/InfSein/hqhelper-dawntrail?style=flat&logo=github) <br>
![GitHub Release](https://img.shields.io/github/v/release/InfSein/hqhelper-dawntrail?style=flat&logo=github) ![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/InfSein/hqhelper-dawntrail/total?style=flat&logo=github)

[简体中文](https://github.com/InfSein/hqhelper-dawntrail/blob/master/README-ZH.md) | [日本語](https://github.com/InfSein/hqhelper-dawntrail/blob/master/docs/README.ja.md) | **English**

## Introductions

One web app designed for ffxiv dawntrail master crafters.

Visit our [Github Page](https://infsein.github.io/hqhelper-dawntrail/) and enjoy!

### Development Progress

This repository is still under construction and may undergo significant changes at any time.

#### To-do List

- [x] i18n
- [ ] Development Document

### Predecessor

The first version of `HQ Helper`(also might be called `HqHelper` below) was a `Windows Forms` app based on `.NET 6.0`. 

The application interface was built by the WinForms designer, and the native UI of Windows.

During the `ENDWALKER` expansion of `Final Fantasy XIV` period, the application established over 50 version updates through online storage and distribution,
providing gamers with production statistics support spanning from `6.0` to `6.4` game patch.

You could still view screenshot, description and tutorials, or just download and run the application from the Release Page in [NGA Player Community](https://bbs.nga.cn/read.php?tid=31596099).

## Development Guidelines

### Patch Management

The patch of this application follows the naming convention of `MAJOR.MINOR.PATCH`.

1. `MAJOR`,`MINOR`,`PATCH` are all pure number;
2. `MAJOR` represents the generation of `HqHelper`, and the adapted large patch of `FFXIV`;
3. `MINOR` represents the adapted medium patch of `FFXIV`;
4. `PATCH` represents the updated patch applied under the conditions specified in `MAJOR` and `MINOR`.

For example, `2.1.17` means:

- The `2nd` generation of `HqHelper`, and it is designed for the `7.x` patch of `FFXIV`;
- Adapted `7.1` patch of `FFXIV`;
- The `17th` updated patch in `2.1.x` series.

> [!NOTE]
> The advancement of `PATCH` can be very aggressive, even if this version only has very small optimizations or fixes. This is because the client only automatically update when there is a change in the version number.

### Clone and Build

```sh
git clone https://github.com/InfSein/hqhelper-dawntrail.git
cd hqhelper-dawntrail
npm i
npm run dev
```

## References

1. [Naive UI](https://github.com/tusen-ai/naive-ui)
2. [FFXIV Axis Font Icons](https://github.com/thewakingsands/ffxiv-axis-font-icons)

Reference may not be all listed above.

## License

MIT

> [!NOTE]
> The license of this project might be changed in the future.
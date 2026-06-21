import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Image, Switch, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import NavBar from '@/components/NavBar';
import styles from './index.module.scss';

const SettingsPage: React.FC = () => {
  const { currentUser, updateCurrentUser, logout } = useTripStore();
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [splitType, setSplitType] = useState('均摊');
  const [cacheSize, setCacheSize] = useState('12.5MB');

  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(currentUser.nickname);


  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleSplitClick = useCallback(() => {
    Taro.showActionSheet({
      itemList: ['均摊', '按比例', '自定义'],
      success: (res) => {
        const types = ['均摊', '按比例', '自定义'];
        setSplitType(types[res.tapIndex]);
      },
    });
  }, []);

  const handleCacheClick = useCallback(() => {
    Taro.showModal({
      title: '提示',
      content: '确定要清除缓存吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '清理中...' });
          setTimeout(() => {
            Taro.hideLoading();
            setCacheSize('0KB');
            Taro.showToast({ title: '缓存已清除', icon: 'success' });
          }, 500);
        }
      },
    });
  }, []);

  const handleNicknameClick = useCallback(() => {
    setNicknameInput(currentUser.nickname);
    setShowNicknameModal(true);
  }, [currentUser.nickname]);

  const handleNicknameConfirm = useCallback(async () => {
    if (!nicknameInput.trim()) {
      Taro.showToast({ title: '昵称不能为空', icon: 'none' });
      return;
    }
    try {
      await updateCurrentUser({ nickname: nicknameInput.trim() });
      setShowNicknameModal(false);
      Taro.showToast({ title: '修改成功', icon: 'success' });
    } catch (err) {
    }
  }, [nicknameInput, updateCurrentUser]);

  const handleAvatarClick = useCallback(() => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0];
        try {
          await updateCurrentUser({ avatar: tempFilePath });
          Taro.showToast({ title: '头像已更新', icon: 'success' });
        } catch (err) {
        }
      },
    });
  }, [updateCurrentUser]);

  const handleAboutClick = useCallback(() => {
    setShowAboutModal(true);
  }, []);

  const handleAgreementClick = useCallback(() => {
    setShowAgreementModal(true);
  }, []);

  const handlePrivacyClick = useCallback(() => {
    setShowPrivacyModal(true);
  }, []);

  const handleNotifyChange = useCallback((value: boolean) => {
    setNotifyEnabled(value);
    Taro.showToast({
      title: value ? '已开启消息通知' : '已关闭消息通知',
      icon: 'none',
    });
  }, []);

  const handleLogout = useCallback(() => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout();
          Taro.showToast({ title: '已退出登录', icon: 'success' });
        }
      },
    });
  }, [logout]);

  const handleItemClick = useCallback((key: string) => {
    switch (key) {
      case 'split':
        handleSplitClick();
        break;
      case 'cache':
        handleCacheClick();
        break;
      case 'nickname':
        handleNicknameClick();
        break;
      case 'avatar':
        handleAvatarClick();
        break;
      case 'about':
        handleAboutClick();
        break;
      case 'agreement':
        handleAgreementClick();
        break;
      case 'privacy':
        handlePrivacyClick();
        break;
      default:
        break;
    }
  }, [
    handleSplitClick,
    handleCacheClick,
    handleNicknameClick,
    handleAvatarClick,
    handleAboutClick,
    handleAgreementClick,
    handlePrivacyClick,
  ]);

  const groups = [
    {
      title: '通用',
      items: [
        {
          key: 'notify',
          type: 'switch',
          icon: '🔔',
          text: '消息通知',
          value: notifyEnabled,
          onChange: handleNotifyChange,
        },
        {
          key: 'split',
          type: 'arrow-text',
          icon: '⚖️',
          text: '默认分摊方式',
          rightText: splitType,
        },
        {
          key: 'cache',
          type: 'text',
          icon: '🗑️',
          text: '清除缓存',
          rightText: cacheSize,
        },
      ],
    },
    {
      title: '账户',
      items: [
        {
          key: 'nickname',
          type: 'arrow-text',
          icon: '✏️',
          text: '修改昵称',
          rightText: currentUser.nickname,
        },
        {
          key: 'avatar',
          type: 'avatar',
          icon: '🖼️',
          text: '修改头像',
          avatar: currentUser.avatar,
        },
      ],
    },
    {
      title: '关于',
      items: [
        {
          key: 'about',
          type: 'arrow',
          icon: 'ℹ️',
          text: '关于我们',
          rightText: '',
        },
        {
          key: 'version',
          type: 'text',
          icon: '📦',
          text: '版本号',
          rightText: 'v1.0.0',
        },
        {
          key: 'agreement',
          type: 'arrow',
          icon: '📄',
          text: '用户协议',
          rightText: '',
        },
        {
          key: 'privacy',
          type: 'arrow',
          icon: '🔒',
          text: '隐私政策',
          rightText: '',
        },
      ],
    },
  ];

  const agreementText = `
用户协议

第一条 总则
1.1 欢迎您使用旅行拼车AA应用（以下简称"本应用"）。本协议是您与本应用之间关于使用本应用服务所订立的协议。
1.2 您在使用本应用之前，请仔细阅读本协议的全部内容。如您不同意本协议的任何内容，请不要使用本应用。
1.3 您使用本应用的行为，即视为您已阅读并同意受本协议的约束。

第二条 服务内容
2.1 本应用为用户提供旅行费用记录、AA分账、同伴管理等功能服务。
2.2 本应用保留随时变更、中断或终止部分或全部服务的权利。

第三条 用户注册与账户
3.1 用户在使用本应用时可能需要注册账户。用户应提供真实、准确、完整的个人信息。
3.2 用户应妥善保管账户信息，对账户下的所有行为负责。
3.3 用户发现账户被盗用时，应立即通知本应用。

第四条 用户行为规范
4.1 用户在使用本应用时，应遵守相关法律法规，不得利用本应用从事任何违法违规活动。
4.2 用户不得发布、传播违法、违规、侵权或违反公序良俗的内容。
4.3 用户不得干扰本应用的正常运行，不得入侵本应用系统。

第五条 知识产权
5.1 本应用的所有内容，包括但不限于文字、图片、音频、视频、软件等，均受相关知识产权法律保护。
5.2 未经本应用书面许可，任何人不得擅自使用、复制、传播本应用的任何内容。

第六条 隐私保护
6.1 本应用重视用户隐私保护，将按照隐私政策处理用户的个人信息。
6.2 用户使用本应用，即视为同意本应用按照隐私政策处理其个人信息。

第七条 免责声明
7.1 本应用提供的服务仅供参考，不对用户的任何决策承担责任。
7.2 因不可抗力或本应用不可控因素导致的服务中断，本应用不承担责任。
7.3 用户因使用本应用而产生的任何直接或间接损失，本应用不承担责任。

第八条 协议变更
8.1 本应用保留随时修改本协议的权利。
8.2 协议变更后，用户继续使用本应用，即视为同意修改后的协议。

第九条 争议解决
9.1 本协议的解释和执行适用中华人民共和国法律。
9.2 因本协议引起的争议，双方应友好协商解决；协商不成的，可向本应用所在地人民法院提起诉讼。

第十条 其他
10.1 本协议的标题仅为阅读方便，不影响本协议的解释。
10.2 本应用未行使或延迟行使任何权利，不构成对该权利的放弃。
10.3 如本协议的任何条款被认定为无效或不可执行，不影响其他条款的效力。
  `.trim();

  const privacyText = `
隐私政策

引言
旅行拼车AA应用（以下简称"我们"）非常重视用户的隐私保护。本隐私政策旨在说明我们如何收集、使用、存储和保护您的个人信息。

一、信息收集
1.1 注册信息：当您注册账户时，我们可能收集您的昵称、头像、手机号等信息。
1.2 使用信息：我们可能收集您使用本应用的行为数据，如操作记录、使用习惯等。
1.3 设备信息：我们可能收集您的设备型号、操作系统、唯一设备标识符等信息。
1.4 位置信息：经您授权后，我们可能收集您的位置信息，用于提供相关服务。

二、信息使用
2.1 提供服务：我们使用收集的信息为您提供本应用的各项功能服务。
2.2 改进服务：我们可能使用信息进行数据分析，以改进和优化本应用的服务质量。
2.3 安全保障：我们可能使用信息保障账户安全和应用安全。
2.4 消息通知：我们可能使用您的信息向您发送服务通知、活动通知等。

三、信息共享
3.1 我们不会向第三方出售您的个人信息。
3.2 我们可能在以下情况下共享您的信息：
   （1）获得您的明确同意；
   （2）根据法律法规的要求；
   （3）为了保护我们或第三方的合法权益；
   （4）与我们的关联公司共享，用于提供服务。

四、信息存储
4.1 我们会采取合理的安全措施保护您的个人信息安全。
4.2 我们会在实现目的所必需的最短时间内保留您的个人信息。
4.3 我们会将您的信息存储在中华人民共和国境内，如需跨境传输，我们会遵守相关规定。

五、您的权利
5.1 访问权：您有权访问您的个人信息。
5.2 更正权：您有权要求更正您的不准确或不完整的个人信息。
5.3 删除权：在特定情况下，您有权要求删除您的个人信息。
5.4 注销权：您有权注销您的账户。
5.5 撤回同意：您有权撤回对个人信息收集和使用的同意。

六、未成年人保护
6.1 我们非常重视未成年人的隐私保护。
6.2 若您是未满十八周岁的未成年人，请在监护人的陪同下阅读本政策，并在监护人同意的情况下使用本应用。

七、政策更新
7.1 我们可能适时更新本隐私政策。
7.2 更新后的政策会在本应用内发布，您继续使用本应用即视为同意更新后的政策。

八、联系我们
8.1 如您对本隐私政策有任何疑问或建议，请通过本应用内的意见反馈渠道联系我们。
  `.trim();

  return (
    <View className={styles.page}>
      <NavBar title="设置" showBack />
      <ScrollView scrollY className={styles.scroll}>
        {groups.map((group, groupIndex) => (
          <View key={groupIndex} className={styles.group}>
            <Text className={styles.groupTitle}>{group.title}</Text>
            <View className={styles.card}>
              {group.items.map((item, itemIndex) => (
                <View
                  key={item.key}
                  className={`${styles.item} ${
                    itemIndex === group.items.length - 1
                      ? styles.itemLast
                      : ''
                  }`}
                  onClick={() => {
                    if (item.type !== 'switch') {
                      handleItemClick(item.key);
                    }
                  }}
                >
                  <Text className={styles.itemIcon}>{item.icon}</Text>
                  <Text className={styles.itemText}>{item.text}</Text>

                  {item.type === 'switch' && (
                    <Switch
                      checked={item.value}
                      onChange={(e) => item.onChange?.(e.detail.value)}
                      color="#ff6b35"
                    />
                  )}

                  {item.type === 'text' && (
                    <Text className={styles.itemRightText}>
                      {item.rightText}
                    </Text>
                  )}

                  {item.type === 'arrow-text' && (
                    <View className={styles.arrowTextWrapper}>
                      <Text className={styles.itemRightText}>
                        {item.rightText}
                      </Text>
                      <Text className={styles.itemArrow}>›</Text>
                    </View>
                  )}

                  {item.type === 'avatar' && (
                    <View className={styles.avatarWrapper}>
                      <Image
                        className={styles.avatarImg}
                        src={item.avatar}
                        mode="aspectFill"
                      />
                      <Text className={styles.itemArrow}>›</Text>
                    </View>
                  )}

                  {item.type === 'arrow' && (
                    <Text className={styles.itemArrow}>›</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View className={styles.logoutSection}>
          <View className={styles.logoutBtn} onClick={handleLogout}>
            <Text className={styles.logoutText}>退出登录</Text>
          </View>
        </View>
      </ScrollView>

      {showNicknameModal && (
        <View className={styles.modalOverlay} onClick={() => setShowNicknameModal(false)}>
          <View className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>修改昵称</Text>
            <Input
              className={styles.modalInput}
              placeholder="请输入昵称"
              value={nicknameInput}
              onInput={(e) => setNicknameInput(e.detail.value)}
              maxlength={20}
              focus
            />
            <View className={styles.modalButtons}>
              <View
                className={`${styles.modalBtn} ${styles.modalBtnCancel}`}
                onClick={() => setShowNicknameModal(false)}
              >
                <Text className={styles.modalBtnCancelText}>取消</Text>
              </View>
              <View
                className={`${styles.modalBtn} ${styles.modalBtnConfirm}`}
                onClick={handleNicknameConfirm}
              >
                <Text className={styles.modalBtnConfirmText}>确定</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showAboutModal && (
        <View className={styles.modalOverlay} onClick={() => setShowAboutModal(false)}>
          <View className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>关于我们</Text>
            <View className={styles.aboutContent}>
              <Text className={styles.aboutAppName}>旅行拼车 AA</Text>
              <Text className={styles.aboutVersion}>版本 v1.0.0</Text>
              <Text className={styles.aboutDesc}>让每一次旅行都清清楚楚</Text>
              <Text className={styles.aboutCopyright}>© 2024 旅行拼车AA</Text>
            </View>
            <View className={styles.modalButtons}>
              <View
                className={`${styles.modalBtn} ${styles.modalBtnFull} ${styles.modalBtnConfirm}`}
                onClick={() => setShowAboutModal(false)}
              >
                <Text className={styles.modalBtnConfirmText}>关闭</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showAgreementModal && (
        <View className={styles.modalOverlay} onClick={() => setShowAgreementModal(false)}>
          <View className={styles.modalCardLarge} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>用户协议</Text>
            <ScrollView scrollY className={styles.modalScroll}>
              <Text className={styles.modalText}>{agreementText}</Text>
            </ScrollView>
            <View className={styles.modalButtons}>
              <View
                className={`${styles.modalBtn} ${styles.modalBtnFull} ${styles.modalBtnConfirm}`}
                onClick={() => setShowAgreementModal(false)}
              >
                <Text className={styles.modalBtnConfirmText}>关闭</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showPrivacyModal && (
        <View className={styles.modalOverlay} onClick={() => setShowPrivacyModal(false)}>
          <View className={styles.modalCardLarge} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>隐私政策</Text>
            <ScrollView scrollY className={styles.modalScroll}>
              <Text className={styles.modalText}>{privacyText}</Text>
            </ScrollView>
            <View className={styles.modalButtons}>
              <View
                className={`${styles.modalBtn} ${styles.modalBtnFull} ${styles.modalBtnConfirm}`}
                onClick={() => setShowPrivacyModal(false)}
              >
                <Text className={styles.modalBtnConfirmText}>关闭</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SettingsPage;

-- license:BSD-3-Clause
-- copyright-holders:MAMEdev Team

---------------------------------------------------------------------------
--
--   gng_web.lua
--
--   GNG Web build
--
---------------------------------------------------------------------------

CPUS["M6809"] = true
CPUS["Z80"] = true

SOUNDS["YM2203"] = true
SOUNDS["SPEAKER"] = true

MACHINES["TTL74259"] = true
MACHINES["GEN_LATCH"] = true

VIDEOS["BUFSPRITE"] = true

function createProjects_mame_gng_web(_target, _subtarget)
	project ("mame_gng_web")
	targetsubdir(_target .."_" .. _subtarget)
	kind (LIBTYPE)
	uuid (os.uuid("drv-mame-gng-web"))
	addprojectflags()
	precompiledheaders_novs()

	includedirs {
		MAME_DIR .. "src/osd",
		MAME_DIR .. "src/emu",
		MAME_DIR .. "src/devices",
		MAME_DIR .. "src/mame/shared",
		MAME_DIR .. "src/lib",
		MAME_DIR .. "src/lib/util",
		MAME_DIR .. "3rdparty",
		GEN_DIR  .. "mame/layout",
	}

    files{
        MAME_DIR .. "src/mame/capcom/gng.cpp",
    }
end

function linkProjects_mame_gng_web(_target, _subtarget)
	links {
		"mame_gng_web",
	}
end

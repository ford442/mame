-- license:BSD-3-Clause
-- copyright-holders:MAMEdev Team

---------------------------------------------------------------------------
--
--   gng.lua
--
--   Ghost n' Goblins specific makefile
--   Use make SUBTARGET=gng to build
--
---------------------------------------------------------------------------

--------------------------------------------------
-- Specify all the CPU cores necessary for the
-- drivers referenced in gng.lst.
--------------------------------------------------

CPUS["M6809"] = true
CPUS["Z80"] = true

--------------------------------------------------
-- Specify all the sound cores necessary for the
-- drivers referenced in gng.lst.
--------------------------------------------------

SOUNDS["YM2203"] = true
SOUNDS["SPEAKER"] = true

--------------------------------------------------
-- specify available video cores
--------------------------------------------------
-- GnG uses buffered spriteram (bufsprite.h) which is handled as a device.
-- The core video system is always included.
VIDEOS["BUFSPRITE"] = true

--------------------------------------------------
-- specify available machine cores
--------------------------------------------------

MACHINES["TTL74259"] = true
MACHINES["GEN_LATCH"] = true

--------------------------------------------------
-- This is the list of files that are necessary
-- for building all of the drivers referenced
-- in gng.lst
--------------------------------------------------

function createProjects_mame_gng(_target, _subtarget)
	project ("mame_gng")
	targetsubdir(_target .."_" .. _subtarget)
	kind (LIBTYPE)
	uuid (os.uuid("drv-mame-gng"))
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

function linkProjects_mame_gng(_target, _subtarget)
	links {
		"mame_gng",
	}
end
